import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { ConvertToArray } from './ConvertToArray';

const testWrapper = (action: string, value: any, array: any[], valid: boolean = true) => {
  return test(`[${action}] can${!valid ? ' not' : ''} be converted to array`, () => {
    return client()
      .query(ConvertToArray.response(value) as Expr)
      .then((response: any) => {
        expect(new Set(response)).toEqual(new Set(array));
      });
  }, 10000);
};
describe('ConvertToArray', () => {
  testWrapper('array_from_string', values.array_from_string, ['one', 'two', 'three'], true);
  testWrapper(
    'array_from_object',
    values.array_from_object,
    [
      ['one', 1],
      ['two', 2],
    ],
    true,
  );
});
