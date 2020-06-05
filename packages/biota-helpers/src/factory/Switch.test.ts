import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { Switch } from './Switch';

const testWrapper = (action: string, value: string, cases: object, result: any, defaultValue?: any) => {
  return test(`[${action}] has been switched properly`, () => {
    return client()
      .query(Switch.response(value, cases, defaultValue) as Expr)
      .then((response: any) => {
        expect(response).toEqual(result);
      });
  }, 10000);
};

describe('Switch', () => {
  testWrapper('numbers', '1', values.object_numbers, 'one');
  testWrapper('numbers', '2', values.object_numbers, 'two');
  testWrapper('numbers', '3', values.object_numbers, 'three');
  testWrapper('numbers', '4', values.object_numbers, null);
  testWrapper('numbers', '5', values.object_numbers, {}, {});
});
