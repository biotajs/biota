import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { token } from './token';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'tokens', version: packagejson.version });

export const tokens: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  FindByInstance: {
    name: 'FindByInstance',
    params: ['instance', 'pagination'],
    defaults: [null, {}],
    query(instance, pagination) {
      return Pagination(q.Match(q.Index('biota.tokens__by__instance'), instance), pagination);
    },
  },
  GetAll: {
    name: 'GetAll',
    params: ['pagination'],
    defaults: [{}],
    query(pagination) {
      return q.Map(Pagination(q.Tokens(), pagination), q.Lambda('x', q.Get(q.Var('x'))));
    },
  },
  GetMany: {
    name: 'GetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], token.Get.response(q.Var('name'))));
    },
  },
  InsertMany: {
    name: 'InsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], token.Insert.response(null, q.Var('definition'))));
    },
  },
  UpdateMany: {
    name: 'UpdateMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], token.Update.response(null, q.Var('definition'))));
    },
  },
  UpsertMany: {
    name: 'UpsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], token.Upsert.response(null, q.Var('definition'))));
    },
  },
  ReplaceMany: {
    name: 'ReplaceMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], token.Replace.response(null, q.Var('definition'))));
    },
  },
  RepsertMany: {
    name: 'RepsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], token.Repsert.response(null, q.Var('definition'))));
    },
  },
  DeleteMany: {
    name: 'DeleteMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], token.Delete.response(q.Var('name'))));
    },
  },
  RestoreMany: {
    name: 'RestoreMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], token.Restore.response(q.Var('name'))));
    },
  },
  ForgetMany: {
    name: 'ForgetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], token.Forget.response(q.Var('name'))));
    },
  },
  DropMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], token.Drop.response(q.Var('name'))));
    },
  },
  ExpireMany: {
    name: 'DropMany',
    params: ['namesList', 'at'],
    defaults: [[], null],
    query(namesList, at) {
      return q.Map(namesList, q.Lambda(['name'], token.Expire.response(q.Var('name'), at)));
    },
  },
  ExpireInMany: {
    name: 'DropMany',
    params: ['namesList', 'delay'],
    defaults: [[], null],
    query(namesList, delay) {
      return q.Map(namesList, q.Lambda(['name'], token.ExpireIn.response(q.Var('name'), delay)));
    },
  },
  ExpireNowMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], token.ExpireNow.response(q.Var('name'))));
    },
  },
});
