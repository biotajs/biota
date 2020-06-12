import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { factory as constantsFactory } from '@biota/constants';

const build = new Builder({ lib: 'biota.core', path: 'data', version: packagejson.version });

export const data: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  IsDeleted: {
    name: 'IsDeleted',
    params: ['data'],
    defaults: [{}],
    query(data) {
      return q.Select(['_validity', 'deleted'], data, false);
    },
  },
  IsExpired: {
    name: 'IsExpired',
    params: ['data'],
    defaults: [{}],
    query(data) {
      return q.GTE(
        q.Select(
          ['_validity', 'deleted'],
          data,
          q.ToTime(constantsFactory.constants.NumbersSelect.response('TS_2500_YEARS')),
        ),
        q.Now(),
      );
    },
  },
});
