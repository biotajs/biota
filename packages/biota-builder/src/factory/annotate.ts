import { query as q } from 'faunadb';
import { Builder } from '../builder';
import packagejson from './../../package.json';

const build = new Builder({ lib: 'biota.builder', version: packagejson.version });
const userIdentity = build.identity(q.Var('ctx'));

export const annotate = build.method({
  name: 'annotate',
  params: ['action', 'data'],
  defaults: [null, {}],
  before: () => ({
    activity: {
      insert: { inserted_by: userIdentity, inserted_at: q.Now() },
      update: { updated_by: userIdentity, updated_at: q.Now() },
      replace: { replaced_by: userIdentity, replaced_at: q.Now() },
      delete: { deleted_by: userIdentity, deleted_at: q.Now() },
      forget: { forgotten_by: userIdentity, forgotten_at: q.Now() },
      restore: { restored_by: userIdentity, restored_at: q.Now() },
      remember: { remembered_by: userIdentity, remembered_at: q.Now() },
      expire: { expiration_changed_by: userIdentity, expiration_changed_at: q.Now() },
      credentials_change: { credentials_changed_by: userIdentity, credentials_changed_at: q.Now() },
      auth_email_change: { auth_email_changed_by: userIdentity, auth_email_changed_at: q.Now() },
      auth_accounts_change: {
        auth_accounts_changed_by: userIdentity,
        auth_accounts_changed_at: q.Now(),
      },
      public_change: { public_changed_by: userIdentity, public_changed_at: q.Now() },
      roles_change: { roles_changed_by: userIdentity, roles_changed_at: q.Now() },
      owner_change: { owner_changed_by: userIdentity, owner_changed_at: q.Now() },
      assignees_change: { assignees_changed_by: userIdentity, assignees_changed_at: q.Now() },
    },
  }),
  query(action, data) {
    return q.Let(
      {
        _activity: q.Select(action, q.Var('activity'), {}),
        data_activity: q.Select('_activity', data, {}),
        merged_activity: q.Merge(q.Var('data_activity'), q.Var('_activity')),
      },
      q.If(q.IsObject(q.Var('_activity')), q.Merge(data, { _activity: q.Var('merged_activity') }), data),
    );
  },
});
