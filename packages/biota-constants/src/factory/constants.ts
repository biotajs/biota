import { query as q } from 'faunadb';
import { Builder, types } from '@biota/builder';
import packagejson from './../../package.json';

const build = new Builder({ lib: 'biota.constants', version: packagejson.version });

export const constants: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  strings: {
    name: 'strings',
    query() {
      return {
        SIMPLE_SEPARATOR: '_',
        DOUBLE_SEPARATOR: '__',
        FALSE_EXPR: 'BIOTA.FALSE',
      };
    },
  },
  stringsSelect: {
    name: 'stringsSelect',
    params: ['key'],
    defaults: [null],
    query(key) {
      return q.Select(key, constants.Strings.response(), null);
    },
  },
  numbers: {
    name: 'numbers',
    query() {
      return {
        TS_2500_YEARS: 31556952 * 1000 * 530,
        PAGINATION_SIZE_MAX: 100000,
        PAGINATION_SIZE_DEFAULT: 100,
        SAFE_WAIT_TIME: 65000,
        DEFAULT_EXPIRATION_DURATION: 3600 * 24,
      };
    },
  },
  numbersSelect: {
    name: 'numbersSelect',
    params: ['key'],
    defaults: [null],
    query(key) {
      return q.Select(key, constants.Numbers.response(), null);
    },
  },
  patterns: {
    name: 'patterns',
    query() {
      return {
        DATE: '^((19|2[0-9])[0-9]{2})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$',
        TRIM_LEFT: '^/+',
        TRIM_RIGHT: '/+$',
        SOME_NUM: '[0-9]*\\.?[0-9]+',
        START_BY_NUM: '^[0-9]*$',
        ALPHA: '^[a-zA-Z]+$',
        ALPHANUM: '^[a-zA-Z0-9]+$',
        ALPHADASH: '^[a-zA-Z0-9_-]+$',
        EMAIL: '^(.+)@(.+)$',
        EMAIL_PRECISE: '^[\\w!#$%&’*+/=?`{|}~^-]+(?:\\.[\\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,6}$',
        MAC: '^([a-fA-F0-9][:-]){5}[a-fA-F0-9][:-]$',
      };
    },
  },
  patternsSelect: {
    name: 'patternsSelect',
    params: ['key'],
    defaults: [null],
    query(key) {
      return q.Select(key, constants.Patterns.response(), null);
    },
  },
  types: {
    name: 'types',
    query() {
      return {
        any: 'any',
        array: 'array',
        boolean: 'boolean',
        bytes: 'bytes',
        collection: 'collection',
        credentials: 'credentials',
        database: 'database',
        date: 'date',
        document: 'document',
        function: 'function',
        index: 'index',
        key: 'key',
        lambda: 'lambda',
        null: 'null',
        number: 'number',
        object: 'object',
        reference: 'reference',
        role: 'role',
        set: 'set',
        string: 'string',
        time: 'time',
        token: 'token',
      };
    },
  },
  typesSelect: {
    name: 'typesSelect',
    params: ['key'],
    defaults: [null],
    query(key) {
      return q.Select(key, constants.Types.response(), null);
    },
  },
});
