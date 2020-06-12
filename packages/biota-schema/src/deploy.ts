import fauna from 'faunadb';
import { deploy as buiderDeploy } from '@biota/builder';
import { factory as constantsFactory } from '@biota/constants';
import { factory as helpersFactory } from '@biota/helpers';
import { factory as errorHelper } from '@biota/error';
import * as factory from './factory';

// import * as schemas from './schemas';

const q = fauna.query;

export async function deploy(secret: string, { retry = 8 }: { retry?: number } = {}) {
  await buiderDeploy(secret, [factory, constantsFactory, helpersFactory, errorHelper], { retry });
  // await new fauna.Client({ secret }).query(
  //   q.Map(
  //     Object.values(schemas),
  //     q.Lambda(
  //       'schema',
  //       factory.schema.Upsert.callResponse(
  //         q.Select('name', q.Var('schema'), null),
  //         q.Select('body', q.Var('schema'), null),
  //         q.Select('version', q.Var('schema'), null),
  //       ),
  //     ),
  //   ),
  // );
}
