import { query as q, ExprArg } from 'faunadb';

export const Pagination = (set: ExprArg, pagination: ExprArg) =>
  q.If(
    q.Contains(['before'], pagination),
    q.Paginate(set, {
      before: q.Select('before', pagination, null),
      size: q.Select('size', pagination, 100),
      events: q.Select('events', pagination, false),
      ts: q.Select('ts', pagination, q.Now()),
    }),
    q.If(
      q.Contains(['after'], pagination),
      q.Paginate(set, {
        after: q.Select('after', pagination, 0),
        size: q.Select('size', pagination, 100),
        events: q.Select('events', pagination, false),
        ts: q.Select('ts', pagination, q.Now()),
      }),
      q.Paginate(set, {
        size: q.Select('size', pagination, 100),
        events: q.Select('events', pagination, false),
        ts: q.Select('ts', pagination, q.Now()),
      }),
    ),
  );
