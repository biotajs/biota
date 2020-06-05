import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { TypeOf } from "./TypeOf"

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const StringSplit: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'StringSplit',
  params: ['str', 'delimiter'],
  defaults: [null, "."],
  query(str, delimiter) {
    return  q.If(
      q.Not(q.IsString(str)),
      q.Abort(q.Concat(['SplitString only accept strings', TypeOf.response(str)])),
      q.Map(
        q.Let(
          {
            splitted: q.FindStrRegex(str, q.Concat(['[^\\', delimiter, ']+'])),
          },
          q.If(q.IsNonEmpty(q.Var('splitted')), q.Var('splitted'), [str]),
        ),
        q.Lambda('match', q.Select('data', q.Var('match'), null)),
      ),
    );
  },
});

