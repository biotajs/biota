import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { collection } from './collection';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'collections', version: packagejson.version });

export const collections: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  GetAll: {
    name: 'GetAll',
    params: ['pagination'],
    defaults: [{}],
    query(pagination) {
      return q.Map(Pagination(q.Databases(), pagination), q.Lambda('x', q.Get(q.Var('x'))));
    },
  },
  GetMany: {
    name: 'GetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], collection.Get.response(q.Var('name'))));
    },
  },
  InsertMany: {
    name: 'InsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], collection.Insert.response(null, q.Var('definition'))));
    },
  },
  UpdateMany: {
    name: 'UpdateMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], collection.Update.response(null, q.Var('definition'))));
    },
  },
  UpsertMany: {
    name: 'UpsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], collection.Upsert.response(null, q.Var('definition'))));
    },
  },
  ReplaceMany: {
    name: 'ReplaceMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], collection.Replace.response(null, q.Var('definition'))));
    },
  },
  RepsertMany: {
    name: 'RepsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], collection.Repsert.response(null, q.Var('definition'))));
    },
  },
  DeleteMany: {
    name: 'DeleteMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], collection.Delete.response(q.Var('name'))));
    },
  },
  RestoreMany: {
    name: 'RestoreMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], collection.Restore.response(q.Var('name'))));
    },
  },
  ForgetMany: {
    name: 'ForgetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], collection.Forget.response(q.Var('name'))));
    },
  },
  DropMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], collection.Drop.response(q.Var('name'))));
    },
  },
  ExpireMany: {
    name: 'DropMany',
    params: ['namesList', 'at'],
    defaults: [[], null],
    query(namesList, at) {
      return q.Map(namesList, q.Lambda(['name'], collection.Expire.response(q.Var('name'), at)));
    },
  },
  ExpireInMany: {
    name: 'DropMany',
    params: ['namesList', 'delay'],
    defaults: [[], null],
    query(namesList, delay) {
      return q.Map(namesList, q.Lambda(['name'], collection.ExpireIn.response(q.Var('name'), delay)));
    },
  },
  ExpireNowMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], collection.ExpireNow.response(q.Var('name'))));
    },
  },
});
