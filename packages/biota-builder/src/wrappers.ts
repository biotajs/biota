import { ExprArg, query as q } from 'faunadb';

export function Response(result: ExprArg) {
  return q.Select('response', result, null);
}

export function Actions(result: ExprArg) {
  return q.Select('actions', result, []);
}

export function Errors(result: ExprArg) {
  return q.Select('errors', result, []);
}

export function Success(result: ExprArg) {
  return q.Select('success', result, false);
}
