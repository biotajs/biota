import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { factory as constantsFactory } from '@biota/constants';

const build = new Builder({ lib: 'biota.core', path: 'wrappers', version: packagejson.version });

export const wrappers: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  pagination: {
    name: 'pagination',
    params: ['options'],
    defaults: [{}],
    query(options) {
      return {
        after: q.Select('after', options, 0),
        // #bug before: q.Select('before', options, null),
        size: q.Select(
          'size',
          options,
          constantsFactory.constants.NumbersSelect.response('PAGINATION_SIZE_DEFAULT'),
        ),
        events: q.Select('events', options, false),
        ts: q.Select('ts', options, q.Now()),
      };
    },
  },
});
