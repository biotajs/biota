import fauna from 'faunadb';
import * as builderFactory from './factory';
import { scaffolds } from './builder';

export async function deploy(secret: string, factories: any[] = [], { retry = 8 }: { retry?: number } = {}) {
  const db = new fauna.Client({ secret });
  let settled = null;
  let deployed = 0;
  let retryCount = retry;
  const allParts = [builderFactory, ...factories].map((f) => scaffolds(f)).flat();
  const parts = Array.from(new Set(allParts));
  // console.log('allParts', allParts.length, 'parts', parts.length);
  // console.log(parts.map((p) => p.name).sort());
  // console.log(parts.find((p) => p.name.includes('CanConvertToArray')));

  async function push() {
    console.log('Batch n°', retry - retryCount);
    if (!settled || settled.find((s) => s.status === 'rejected')) {
      const exprs = !settled
        ? parts
        : settled.reduce(
            (list, result, idx) => (result.status === 'rejected' ? list.push(parts[idx]) && list : list),
            [],
          );
      const prom = [];
      console.log('exprs', exprs.map((e) => e.name).sort());
      if (Array.isArray(settled)) {
        console.log(
          'exprs',
          settled.filter((s) => s.status === 'rejected').map((s) => s.reason),
        );
      }

      for (const expr of exprs) {
        prom.push(db.query(expr));
      }

      settled = await Promise.allSettled(prom);
      // await new Promise((resolve) => setTimeout(resolve, 3000));

      const added = settled.filter((s) => s.status === 'fulfilled').length;
      console.log('newly deployed', added);
      if (Array.isArray(settled)) deployed += added;
      while (retryCount-- && retryCount > 0 && settled.find((s) => s.status === 'rejected')) {
        await push();
      }

      if (settled.find((s: PromiseSettledResult<any>) => s.status === 'rejected')) {
        console.log('Still undeployed functions: ' + settled.filter((s) => s.status === 'rejected').length);
      }
    }
  }

  await push();
  console.log('deployed in total', deployed, '/', parts.length);
  const rejected = settled.filter((s) => s.status === 'rejected');
  if (rejected.length > 0) {
    for (const udf of rejected) {
      console.log('rejected:', udf.reason);
    }
  }
  return null;
}
