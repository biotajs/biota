import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { Merge } from './Merge';

const testWrapper = (action: string, value: object, addition: object, result: object) => {
  return test(`[${action}] has been merged`, () => {
    return client()
      .query(Merge.response(value, addition) as Expr)
      .then((response: any) => {
        expect(response).toEqual(result);
      });
  }, 10000);
};

describe('Merge', () => {
  const simpleObject = { simple: true };
  testWrapper('object', values.object, simpleObject, Object.assign({}, values.object, simpleObject));
});
