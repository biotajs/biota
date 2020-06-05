import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { CallElse } from './CallElse';
import { IsFalse } from './IsFalse';

const testWrapper = (action: string, functionName: string, params: object, result: any, success: boolean = true) => {
  return test(`[${action}] has ${!success ? 'not ' : ''}been called`, () => {
    return client()
      .query(CallElse.response(functionName, params) as Expr)
      .then((response: any) => {
        if (success) {
          expect(response.response).toEqual(result);
        } else {
          expect(response).toEqual(result);
        }
      });
  }, 10000);
};

describe('CallElse', () => {
  testWrapper('IsFalse', IsFalse.udfName(), {}, false, true);
  testWrapper('IsFalse', IsFalse.udfName(), { value: 'BIOTA.FALSE' }, true, true);
  testWrapper('IsNotFalse', 'IsNotFalse', {}, {}, false);
});
