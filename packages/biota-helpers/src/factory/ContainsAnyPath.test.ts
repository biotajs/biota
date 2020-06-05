import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { ContainsAnyPath } from './ContainsAnyPath';

const testWrapper = (action: string, value: any, paths: any[], valid: boolean = true) => {
  return test(`[${action}] can${!valid ? ' not' : ''} be converted to string`, () => {
    return client()
      .query(ContainsAnyPath.response(value, paths) as Expr)
      .then((response: any) => {
        expect(response).toBe(valid);
      });
  }, 10000);
};

describe('ContainsAnyPath', () => {
  testWrapper('object', values.object, ['x'], true);
  testWrapper('object', values.object, ['y'], false);
  testWrapper('object_deep', values.object_deep, ['profile.name', 'profile.age', 'address.street'], true);
  testWrapper('object_deep', values.object_deep, ['address.country'], false);
});
