import { query as q } from 'faunadb';
import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import packagejson from '../../package.json';
import { codes } from './../codes';

const build = new Builder({ lib: 'biota.error', version: packagejson.version });

export const error: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Throw: {
    name: 'Throw',
    params: ['code', 'params', 'description', 'options'],
    defaults: [null, {}, '', {}],
    query(code, params, description, options) {
      return q.Let(
        {
          callstack: q.Select('callstack', q.Var('ctx'), []),
          flattenCallstack: q.Concat(q.Var('callstack'), '/|/'),
          result: q.Concat(
            [
              q.Var('flattenCallstack'),
              q.Format('%@', error.Message.response(code, options, {})),
              description,
              q.Format('%@', params),
              q.Format('%@', q.Var('ctx')),
            ],
            '/||/',
          ),
        },
        q.Abort(q.Var('result')),
      );
    },
  },
  Codes: {
    name: 'Codes',
    query() {
      return codes;
    },
  },
  Message: {
    name: 'Message',
    params: ['code', 'options', 'keyValues'],
    defaults: ['', {}, {}],
    query(code, options, keyValues) {
      return q.Let(
        {
          defaultLanguage: q.Select('defaultLanguage', options, 'en'),
          language: q.Select('language', options, q.Var('defaultLanguage')),
          errorCodes: error.Codes.response(),
        },
        q.If(
          q.IsString(code),
          q.If(
            q.Contains(code, q.Var('errorCodes')),
            q.Let(
              {
                message: helpers.FillTemplate.response(
                  q.Select(
                    [code, 'messages', q.Var('language')],
                    q.Var('errorCodes'),
                    q.Select([code, 'message'], q.Var('errorCodes'), ''),
                  ),
                  q.Merge(keyValues, { code }),
                ),
              },
              {
                code,
                message: q.Var('message'),
              },
            ),
            q.Select('unknown', q.Var('errorCodes'), {}),
          ),
          error.Throw.response(codes.data_validation_failed.name, { code }, 'The code should be a string.'),
        ),
      );
    },
  },
});
