import { query as q } from 'faunadb';
import { client } from '../__test__/client';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { role } from './role';

describe('RoleValidate', () => {
  const isItValid = isItValidAndNotSanitized(role);

  beforeAll(() => {
    return client().query(
      q.If(
        q.Exists(q.Role('employees')),
        null,
        q.CreateRole({
          name: 'employees',
          privileges: [],
        }),
      ),
    );
  });

  isItValid(`[role] is role`, values.role);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('role') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not role`, value, {}, false);
    });
});
