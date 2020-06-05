import { client } from '@biota/test';
import { ArrayContains } from './ArrayContains';
import { values } from '../__test__/values';
import { ExprArg, Expr } from 'faunadb';

const testWrapper = (action: string, array: ExprArg, item: ExprArg, valid: boolean = true) => {
  return test(`[${action}] ${valid ? 'does' : 'does not'} contain the item`, () => {
    return client()
      .query(ArrayContains.response(array, item) as Expr)
      .then((response: any) => {
        expect(response).toBe(valid);
      });
  }, 10000);
};

describe('ArrayContains', () => {
  testWrapper('array', values.array, 'array', true);
  testWrapper('array', values.array, 'aray', false);
  testWrapper('array_tuple', values.array_tuple, 'one', true);
  testWrapper('array_tuple', values.array_tuple, 'two', false);
  testWrapper('array_tuple', values.array_tuple, 1, true);
  testWrapper('array_tuple', values.array_tuple, 2, false);
  testWrapper('array_of_strings', values.array_of_strings, 'one', true);
  testWrapper('array_of_strings', values.array_of_strings, 'two', true);
  testWrapper('array_of_strings', values.array_of_strings, 'three', false);
  testWrapper('array_of_strings', values.array_of_strings, 4, false);
  testWrapper('array_of_objects', values.array_of_objects, { x: 1 }, true);
  testWrapper('array_of_objects', values.array_of_objects, { y: 2 }, true);
  testWrapper('array_of_objects', values.array_of_objects, { z: 3 }, false);
  testWrapper('array_of_objects', values.array_of_objects, { w: 4 }, false);
});
