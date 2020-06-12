import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { factory as constantsFactory } from '@biota/constants';

const build = new Builder({ lib: 'biota.core', path: 'credential', version: packagejson.version });

export const credential: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Get: {
    name: 'Get',
    params: ['ref'],
    defaults: [null],
    query(ref) {
      return q.Get(ref);
    },
  },
  Insert: {
    name: 'Insert',
    params: ['instance', 'password'],
    defaults: [null, null],
    annotate: 'insert',
    query(instance, password) {
      return q.Create(q.Credentials(), { instance, password });
    },
    action: 'insert',
  },
  Update: {
    name: 'Update',
    params: ['ref', 'instance', 'currentPassword', 'password'],
    defaults: [null, null, null],
    annotate: 'update',
    query(ref, instance, currentPassword, password) {
      return q.Update(ref, { instance, current_password: currentPassword, password });
    },
    action: 'update',
  },
  // need more?
});
