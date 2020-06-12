import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { document } from './document';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'documents', version: packagejson.version });

export const documents: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  GetAll: {
    name: 'GetAll',
    params: ['collection', 'pagination'],
    defaults: [null, {}],
    query(collection, pagination) {
      return q.Map(Pagination(q.Documents(q.Collection(collection)), pagination), q.Lambda('x', q.Get(q.Var('x'))));
    },
  },
  GetMany: {
    name: 'GetMany',
    params: ['collection', 'idsList'],
    defaults: [null, []],
    query(collection, idsList) {
      return q.Map(idsList, q.Lambda(['id'], document.Get.response(collection, q.Var('id'))));
    },
  },
  InsertMany: {
    name: 'InsertMany',
    params: ['collection', 'optionsList'],
    defaults: [null, []],
    query(collection, optionsList) {
      return q.Map(
        optionsList,
        q.Lambda(
          ['option'],
          document.Insert.response(
            collection,
            q.Select('data', q.Var('option'), {}),
            q.Select('id', q.Var('option'), null),
          ),
        ),
      );
    },
  },
  UpdateMany: {
    name: 'UpdateMany',
    params: ['collection', 'optionsList'],
    defaults: [null, []],
    query(collection, optionsList) {
      return q.Map(
        optionsList,
        q.Lambda(
          ['option'],
          document.Update.response(
            collection,
            q.Select('id', q.Var('option'), null),
            q.Select('data', q.Var('option'), {}),
          ),
        ),
      );
    },
  },
  UpsertMany: {
    name: 'UpsertMany',
    params: ['collection', 'optionsList'],
    defaults: [null, []],
    query(collection, optionsList) {
      return q.Map(
        optionsList,
        q.Lambda(
          ['option'],
          document.Upsert.response(
            collection,
            q.Select('id', q.Var('option'), null),
            q.Select('data', q.Var('option'), {}),
          ),
        ),
      );
    },
  },
  ReplaceMany: {
    name: 'ReplaceMany',
    params: ['collection', 'optionsList'],
    defaults: [null, []],
    query(collection, optionsList) {
      return q.Map(
        optionsList,
        q.Lambda(
          ['option'],
          document.Replace.response(
            collection,
            q.Select('id', q.Var('option'), null),
            q.Select('data', q.Var('option'), {}),
          ),
        ),
      );
    },
  },
  RepsertMany: {
    name: 'RepsertMany',
    params: ['collection', 'optionsList'],
    defaults: [null, []],
    query(collection, optionsList) {
      return q.Map(
        optionsList,
        q.Lambda(
          ['option'],
          document.Repsert.response(
            collection,
            q.Select('id', q.Var('option'), null),
            q.Select('data', q.Var('option'), {}),
          ),
        ),
      );
    },
  },
  DeleteMany: {
    name: 'DeleteMany',
    params: ['collection', 'idsList'],
    defaults: [null, []],
    query(collection, idsList) {
      return q.Map(idsList, q.Lambda(['id'], document.Delete.response(collection, q.Var('id'))));
    },
  },
  RestoreMany: {
    name: 'RestoreMany',
    params: ['collection', 'idsList'],
    defaults: [null, []],
    query(collection, idsList) {
      return q.Map(idsList, q.Lambda(['id'], document.Restore.response(collection, q.Var('id'))));
    },
  },
  ForgetMany: {
    name: 'ForgetMany',
    params: ['collection', 'idsList'],
    defaults: [null, []],
    query(collection, idsList) {
      return q.Map(idsList, q.Lambda(['id'], document.Forget.response(collection, q.Var('id'))));
    },
  },
  DropMany: {
    name: 'DropMany',
    params: ['collection', 'idsList'],
    defaults: [null, []],
    query(collection, idsList) {
      return q.Map(idsList, q.Lambda(['id'], document.Drop.response(collection, q.Var('id'))));
    },
  },
  ExpireMany: {
    name: 'DropMany',
    params: ['collection', 'idsList', 'at'],
    defaults: [null, [], null],
    query(collection, idsList, at) {
      return q.Map(idsList, q.Lambda(['id'], document.Expire.response(collection, q.Var('id'), at)));
    },
  },
  ExpireInMany: {
    name: 'DropMany',
    params: ['collection', 'idsList', 'delay'],
    defaults: [null, [], null],
    query(collection, idsList, delay) {
      return q.Map(idsList, q.Lambda(['id'], document.ExpireIn.response(collection, q.Var('id'), delay)));
    },
  },
  ExpireNowMany: {
    name: 'DropMany',
    params: ['collection', 'idsList'],
    defaults: [null, []],
    query(collection, idsList) {
      return q.Map(idsList, q.Lambda(['id'], document.ExpireNow.response(collection, q.Var('id'))));
    },
  },
});
