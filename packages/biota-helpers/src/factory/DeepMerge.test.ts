import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { DeepMerge } from './DeepMerge';

const testWrapper = (action: string, value: object, addition: object, result: object) => {
  return test(`[${action}] has been deeply merged`, () => {
    return client()
      .query(DeepMerge.response(value, addition) as Expr)
      .then((response: any) => {
        expect(response).toEqual(result);
      });
  }, 10000);
};

describe('DeepMerge', () => {
  const simpleObject = { simple: true };
  testWrapper('object_deep', values.object_deep, simpleObject, Object.assign({}, values.object_deep, simpleObject));

  const deepObject = { deep: { sub: { value: true } } };
  testWrapper('object_deep', values.object_deep, deepObject, Object.assign({}, values.object_deep, deepObject));
});
