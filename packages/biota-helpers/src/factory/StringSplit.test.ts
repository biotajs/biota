import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { StringSplit } from './StringSplit';

const testWrapper = (action: string, value: string, result: object) => {
  return test(`[${action}] has been split`, () => {
    return client()
      .query(StringSplit.response(value) as Expr)
      .then((response: any) => {
        expect(response).toEqual(result);
      });
  }, 10000);
};

describe('StringSplit', () => {
  testWrapper('string', values.string, [values.string]);
  testWrapper('array_from_string_path', values.array_from_string_path, values.array_from_string_path.split('.'));
});
