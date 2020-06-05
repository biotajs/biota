import { client } from '../__test__/client';
import { annotate } from './annotate';

const testAnnotation = (action: string, pathBy: string, pathAt: string) => {
  test(action, async (done) => {
    let { response } = await client().query(annotate.query(action, {}));
    expect(response).toHaveProperty(['_activity', pathBy]);
    expect(response).toHaveProperty(['_activity', pathAt]);
    done();
  });
};

describe('annotate', () => {
  testAnnotation('insert', 'inserted_by', 'inserted_at');
  testAnnotation('update', 'updated_by', 'updated_at');
  testAnnotation('replace', 'replaced_by', 'replaced_at');
  testAnnotation('delete', 'deleted_by', 'deleted_at');
  testAnnotation('forget', 'forgotten_by', 'forgotten_at');
  testAnnotation('restore', 'restored_by', 'restored_at');
  testAnnotation('remember', 'remembered_by', 'remembered_at');
  testAnnotation('expire', 'expiration_changed_by', 'expiration_changed_at');
  testAnnotation('credentials_change', 'credentials_changed_by', 'credentials_changed_at');
  testAnnotation('auth_email_change', 'auth_email_changed_by', 'auth_email_changed_at');
  testAnnotation('auth_accounts_change', 'auth_accounts_changed_by', 'auth_accounts_changed_at');
  testAnnotation('public_change', 'public_changed_by', 'public_changed_at');
  testAnnotation('roles_change', 'roles_changed_by', 'roles_changed_at');
  testAnnotation('owner_change', 'owner_changed_by', 'owner_changed_at');
  testAnnotation('assignees_change', 'assignees_changed_by', 'assignees_changed_at');
});
