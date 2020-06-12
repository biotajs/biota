import fauna from 'faunadb';
import * as builderFactory from './factory';
import { scaffolds } from './builder';
const q = fauna.query;

export async function deploy(
  secret: string,
  factories: any[] = [],
  { retry = 8, byBatch = false, createOnly = false }: { retry?: number; byBatch?: boolean; createOnly?: boolean } = {},
) {
  const db = new fauna.Client({ secret });
  // let settled = null;
  let deployed = 0;
  let retryCount = retry;
  const allParts = [builderFactory, ...factories].map((f) => scaffolds(f, createOnly)).flat();
  const parts = Array.from(new Set(allParts));
  const partsObj = Object.values(allParts).reduce((obj, value) => {
    obj[value.name] = value;
    return obj;
  }, {});
  const uniqueParts = Object.values(partsObj);
  // console.log(
  //   'uniqueParts',
  //   uniqueParts.length,
  //   'keys',
  //   Object.keys(partsObj).length,
  //   'filtered',
  //   Array.from(new Set(uniqueParts.map((i: any) => i.name))).length,
  //   'parts',
  //   parts.length,
  // );

  async function pushPart(part) {
    try {
      await db.query(part).catch(console.error);
    } catch (err) {
      console.error(err);
    }
  }

  if (false) {
    const partsWithDependencies = uniqueParts.map((p: any) => {
      const dependencies = Array.from(JSON.stringify(p.expression).matchAll(/biota\.\w+@[\w\d\.]+\+[\w\d\.]+/g));
      const uniqueDependencies = Array.from(new Set(dependencies.map((r) => r[0]))).filter((n) => n !== p.name);

      return {
        ...p,
        dependencies: uniqueDependencies,
      };
    });

    console.log(
      'partsWithDependencies',
      partsWithDependencies.map((p) => p.dependencies),
      // partsWithDependencies.map((p) => JSON.stringify(p.expression)),
    );

    const MAX_ITERATION = 1000;
    let iterations = 0;
    let deployedNames = [];
    let remainingParts = partsWithDependencies;
    while (remainingParts.length > 0 && iterations < MAX_ITERATION) {
      const pickerPredicate = (p) => p.dependencies.every((d) => deployedNames.includes(d));
      const filterPredicate = (p) => !deployedNames.includes(p.name);
      const items = remainingParts.filter(pickerPredicate);

      if (items.length > 0) {
        console.log(
          'items dependencies',
          items.map((i) => i.dependencies.length),
        );

        console.log('items unique?', items.length, Array.from(new Set(items.map((i) => i.name))).length);
        console.log(
          'remainingParts unique?',
          remainingParts.length,
          Array.from(new Set(remainingParts.map((i) => i.name))).length,
        );

        await pushPart(q.Do(...items));

        deployed += items.length;
        console.log(`Deploying ${items.length} of ${deployed} fns on ${partsWithDependencies.length}.`);
        deployedNames.push(...items.map((i) => i.name));
        remainingParts = remainingParts.filter(filterPredicate);
      } else {
        const chunks = 20;
        const sortedRemainingParts = remainingParts.sort((a, b) => a.dependencies.length - b.dependencies.length);
        const firstRemainingParts = sortedRemainingParts.slice(0, chunks);

        await pushPart(
          q.Do(...firstRemainingParts.map(({ name, expression }) => ({ name, expression })), { add: 1 + 1 }),
        );

        deployed += firstRemainingParts.length;
        console.log(
          `(Trying) Deployed remaining parts ${firstRemainingParts.length} of ${deployed} fns on ${partsWithDependencies.length}.`,
        );

        deployedNames.push(...firstRemainingParts.map((i) => i.name));
        remainingParts = sortedRemainingParts.filter(filterPredicate);
      }
    }
  } else if (byBatch) {
    await pushByBatch(uniqueParts);
  } else {
    await push(uniqueParts);
  }

  async function pushByBatch(batchParts) {
    console.log('Batch n°', retry - retryCount);

    const prom = [];
    let chunk = 40;
    for (let idx = 0; idx < batchParts.length; idx += chunk) {
      prom.push(db.query(q.Do(...batchParts.slice(idx, idx + chunk))));
    }

    const batchSettled = await Promise.allSettled(prom);
    const added = batchSettled.filter((s) => s.status === 'fulfilled').length * chunk;
    console.log('newly deployed', added);
    if (Array.isArray(batchSettled)) deployed += added;
    const missed = batchSettled.filter((s) => s.status !== 'fulfilled');
    if (missed.length > 0) {
      console.log(
        'exprs',
        missed.map((s: any) => s.reason),
      );
    }
    const missedParts = batchSettled.reduce(
      (list, result, idx) => (result.status === 'rejected' ? list.push(batchParts[idx]) && list : list),
      [],
    );

    while (retryCount-- && retryCount > 0 && missed.length > 0) {
      await push(missedParts);
    }

    if (missed.length > 0) {
      console.log('Still undeployed functions: ' + missed.length * chunk);
      console.log(missedParts);
    }
  }

  async function push(batchParts) {
    console.log('Batch n°', retry - retryCount);

    const prom = [];
    for (const expr of batchParts) {
      prom.push(db.query(expr));
    }

    const batchSettled = await Promise.allSettled(prom);
    const added = batchSettled.filter((s) => s.status === 'fulfilled').length;
    console.log('newly deployed', added);
    if (Array.isArray(batchSettled)) deployed += added;
    const missed = batchSettled.filter((s) => s.status !== 'fulfilled');
    if (missed.length > 0) {
      console.log(
        'exprs',
        missed.map((s: any) => s.reason),
      );
    }
    const missedParts = batchSettled.reduce(
      (list, result, idx) => (result.status === 'rejected' ? list.push(batchParts[idx]) && list : list),
      [],
    );

    while (retryCount-- && retryCount > 0 && missed.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await push(missedParts);
    }

    if (missed.length > 0) {
      console.log('Still undeployed functions: ' + missed.length);
      console.log(missedParts);
    }
  }

  console.log('deployed in total', deployed, '/', uniqueParts.length);
  return null;
}
