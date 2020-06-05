import { client } from '@biota/test';
import { ArrayIndexed } from './ArrayIndexed';
import { values } from '../__test__/values';
import { ExprArg, Expr } from 'faunadb';

const testWrapper = (action: string, array: any[]) => {
  return test(`[${action}] is an indexed array`, () => {
    return client()
      .query(ArrayIndexed.response(array) as Expr)
      .then((response: any) => {
        for (const idx in array) {
          expect(response[idx][0]).toBe(+idx);
          expect(response[idx][1]).toStrictEqual(array[idx]);
        }
      });
  }, 10000);
};

describe('ArrayIndexed', () => {
  testWrapper('array', values.array);
  testWrapper('array_tuple', values.array_tuple);
  testWrapper('array_of_strings', values.array_of_strings);
  testWrapper('array_of_numbers', values.array_of_numbers);
  testWrapper('array_of_objects', values.array_of_objects);
});
