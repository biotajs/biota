import { client } from '@biota/test';
import { CanConvertToArray } from './CanConvertToArray';
import { values } from '../__test__/values';
import { ExprArg, Expr } from 'faunadb';

const testWrapper = (action: string, value: any, valid: boolean = true) => {
  return test(`[${action}] can${!valid ? ' not' : ''} be converted to array`, () => {
    return client()
      .query(CanConvertToArray.response(value) as Expr)
      .then((response: any) => {
        expect(response).toBe(valid);
      });
  }, 10000);
};

describe('CanConvertToArray', () => {
  testWrapper('array_from_string', values.array_from_string, true);
  testWrapper('array_from_object', values.array_from_object, true);
});
