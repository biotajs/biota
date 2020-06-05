import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { Slice } from './Slice';

const testWrapper = (action: string, value: object, start: number, end: number, result: object) => {
  return test(`[${action}] has been merged`, () => {
    return client()
      .query(Slice.response(value, start, end) as Expr)
      .then((response: any) => {
        expect(response).toEqual(result);
      });
  }, 10000);
};

describe('Slice', () => {
  testWrapper('array_of_numbers', values.array_of_numbers, 0, 0, [1]);
  testWrapper('array_of_numbers', values.array_of_numbers, 0, 1, [1, 2]);
  testWrapper('array_of_numbers', values.array_of_numbers, 0, 2, [1, 2, 3]);
  testWrapper('array_of_numbers', values.array_of_numbers, 1, 1, [2]);
  testWrapper('array_of_numbers', values.array_of_numbers, 1, 2, [2, 3]);
  testWrapper('array_of_numbers', values.array_of_numbers, 2, 2, [3]);
});
