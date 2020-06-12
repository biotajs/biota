
import { client } from './client';

export const isItValidAndNotSanitized = (type: any, state: any = {}) => {
  return (action: string, value: any, properties: any = {}, valid: boolean = true, sanitized: boolean = false) => {
    return test(
      action,
      async () => {
        // try {
        //   let l = type.Validate.response();
        // } catch (e) {
        //   console.log('type', type);
        //   console.error(e);
        // }
        return (state.hasOwnProperty('db') ? state.db : client())
          .query((type as any).Validate.callResponse(value, properties, {}))
          .then((response: any) => {
            expect(response.valid).toBe(valid);
            expect(response.sanitized).toBe(sanitized);
          })
          // .catch((e) => {
          //   console.log('error', e);
          //   throw e
          // });
      },
      10000,
    );
  };
};
