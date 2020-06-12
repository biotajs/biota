import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { index } from './index';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'indexes', version: packagejson.version });

export const indexes: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  GetAll: {
    name: 'GetAll',
    params: ['pagination'],
    defaults: [{}],
    query(pagination) {
      return q.Map(Pagination(q.Indexes(), pagination), q.Lambda('x', q.Get(q.Var('x'))));
    },
  },
  GetMany: {
    name: 'GetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], index.Get.response(q.Var('name'))));
    },
  },
  InsertMany: {
    name: 'InsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], index.Insert.response(null, q.Var('definition'))));
    },
  },
  UpdateMany: {
    name: 'UpdateMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], index.Update.response(null, q.Var('definition'))));
    },
  },
  UpsertMany: {
    name: 'UpsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], index.Upsert.response(null, q.Var('definition'))));
    },
  },
  ReplaceMany: {
    name: 'ReplaceMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], index.Replace.response(null, q.Var('definition'))));
    },
  },
  RepsertMany: {
    name: 'RepsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], index.Repsert.response(null, q.Var('definition'))));
    },
  },
  DeleteMany: {
    name: 'DeleteMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], index.Delete.response(q.Var('name'))));
    },
  },
  RestoreMany: {
    name: 'RestoreMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], index.Restore.response(q.Var('name'))));
    },
  },
  ForgetMany: {
    name: 'ForgetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], index.Forget.response(q.Var('name'))));
    },
  },
  DropMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], index.Drop.response(q.Var('name'))));
    },
  },
  ExpireMany: {
    name: 'DropMany',
    params: ['namesList', 'at'],
    defaults: [[], null],
    query(namesList, at) {
      return q.Map(namesList, q.Lambda(['name'], index.Expire.response(q.Var('name'), at)));
    },
  },
  ExpireInMany: {
    name: 'DropMany',
    params: ['namesList', 'delay'],
    defaults: [[], null],
    query(namesList, delay) {
      return q.Map(namesList, q.Lambda(['name'], index.ExpireIn.response(q.Var('name'), delay)));
    },
  },
  ExpireNowMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], index.ExpireNow.response(q.Var('name'))));
    },
  },
});
