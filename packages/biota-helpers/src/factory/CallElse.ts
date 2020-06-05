import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const CallElse: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'CallElse',
  params: ['functionName', 'functionParams', 'context', 'defaultValue'],
  defaults: [null, {}, {}, {}],
  query(functionName, functionParams, context, defaultValue) {
    return q.If(q.Exists(q.Function(functionName)), q.Call(functionName, context, functionParams), defaultValue);
  },
});
