import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { function_ } from './function';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'functions', version: packagejson.version });

export const functions: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  GetAll: {
    name: 'GetAll',
    params: ['pagination'],
    defaults: [{}],
    query(pagination) {
      return q.Map(Pagination(q.Functions(), pagination), q.Lambda('x', q.Get(q.Var('x'))));
    },
  },
  GetMany: {
    name: 'GetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], function_.Get.response(q.Var('name'))));
    },
  },
  InsertMany: {
    name: 'InsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], function_.Insert.response(null, q.Var('definition'))));
    },
  },
  UpdateMany: {
    name: 'UpdateMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], function_.Update.response(null, q.Var('definition'))));
    },
  },
  UpsertMany: {
    name: 'UpsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], function_.Upsert.response(null, q.Var('definition'))));
    },
  },
  ReplaceMany: {
    name: 'ReplaceMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], function_.Replace.response(null, q.Var('definition'))));
    },
  },
  RepsertMany: {
    name: 'RepsertMany',
    params: ['optionsList'],
    defaults: [[]],
    query(optionsList) {
      return q.Map(optionsList, q.Lambda(['definition'], function_.Repsert.response(null, q.Var('definition'))));
    },
  },
  DeleteMany: {
    name: 'DeleteMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], function_.Delete.response(q.Var('name'))));
    },
  },
  RestoreMany: {
    name: 'RestoreMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], function_.Restore.response(q.Var('name'))));
    },
  },
  ForgetMany: {
    name: 'ForgetMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], function_.Forget.response(q.Var('name'))));
    },
  },
  DropMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], function_.Drop.response(q.Var('name'))));
    },
  },
  ExpireMany: {
    name: 'DropMany',
    params: ['namesList', 'at'],
    defaults: [[], null],
    query(namesList, at) {
      return q.Map(namesList, q.Lambda(['name'], function_.Expire.response(q.Var('name'), at)));
    },
  },
  ExpireInMany: {
    name: 'DropMany',
    params: ['namesList', 'delay'],
    defaults: [[], null],
    query(namesList, delay) {
      return q.Map(namesList, q.Lambda(['name'], function_.ExpireIn.response(q.Var('name'), delay)));
    },
  },
  ExpireNowMany: {
    name: 'DropMany',
    params: ['namesList'],
    defaults: [[]],
    query(namesList) {
      return q.Map(namesList, q.Lambda(['name'], function_.ExpireNow.response(q.Var('name'))));
    },
  },
});
