import {
  BiotaBuilderDefinition,
  BiotaBuilderDefinitionHandler,
  BiotaBuilderDefinitionKeyed,
  BiotaBuilderMethodOutputAPI,
  BiotaBuilderMethodOutputAPIKeyed,
  BiotaBuilderOptions,
  BiotaBuilderOptionsActionOptions,
} from './types';
import { ExprVal, query as q } from 'faunadb';
import { functionArgumentsNames } from './utils/functionArgumentsNames';

function functionToExpresion(this: any, fn: BiotaBuilderDefinitionHandler, params: string[] = []) {
  return fn.apply(
    this,
    params.map((param: string) => q.Var(param)),
  );
}

export class Builder {
  lib?: string;
  version?: string;
  path: string;
  annotate: boolean;
  action: boolean;
  actionOptions: BiotaBuilderOptionsActionOptions;
  context: any;
  defaults: BiotaBuilderDefinition;

  constructor(options?: BiotaBuilderOptions) {
    const {
      annotate = false,
      action = false,
      lib = null,
      version = null,
      path = '',
      actionOptions = {},
      context = {},
      identity,
      defaults = { name: null, query: null },
    } = options || {};

    this.annotate = annotate;
    this.action = action;
    this.lib = lib;
    this.version = version;
    this.path = path;
    this.actionOptions = { collection: 'biota.actions', ...actionOptions };
    this.context = context;
    this.defaults = defaults;

    if (typeof identity === 'function') {
      this.identity = identity;
    } else {
      this.identity = (ctx) => q.If(q.HasIdentity(), q.Identity(), false);
    }
  }

  get vars() {
    return {
      annotationName: q.Var('annotationName'),
      annotationData: q.Var('annotationData'),
      annotationOutput: q.Var('annotationOutput'),
      actionName: q.Var('actionName'),
      actionUser: q.Var('actionUser'),
      actionRef: q.Var('actionRef'),
    };
  }

  identity: (ctx: ExprVal) => ExprVal;

  methodName(name?: string, path?: string, lib?: string, version?: string) {
    path = path || this.path;
    lib = lib || this.lib;
    version = version || this.version || '';
    const list = typeof path === 'string' && path.length > 0 ? path.split('.') : [];
    if (name) list.push(name);
    const libVersionned = lib ? lib + '@' + version : '';
    const fnName = list.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    return lib ? `${libVersionned}+${fnName}` : fnName;
  }

  methods(definitionsObject: BiotaBuilderDefinitionKeyed): BiotaBuilderMethodOutputAPIKeyed {
    const definitions: BiotaBuilderMethodOutputAPIKeyed = {};
    for (const methodName of Object.keys(definitionsObject)) {
      definitions[methodName] = this.method(definitionsObject[methodName]);
    }
    return definitions;
  }

  method(definition: BiotaBuilderDefinition): BiotaBuilderMethodOutputAPI {
    const self = this;

    const { before, query, after, context = (ctx: any) => ctx } = definition || {};
    const methods = [before, query, after].filter((f) => typeof f === 'function');
    const paramsList = methods.map((method) => functionArgumentsNames(method));
    const params: string[] =
      definition.params ||
      this.defaults.params ||
      (paramsList.reduce((list, params) => {
        const isUnderscoreOnly = (item: string) => item.replace('_', '');
        if (list.length === 0) {
          list = params;
        } else {
          for (const i of Object.keys(list)) {
            list[i] = !isUnderscoreOnly(params[i]) ? params[i] : list[i];
          }
        }
        return list;
      }, []) as string[]);

    const extend = (bindings: Object) => (next: ExprVal) => q.Let(bindings, next);

    const _pipe = (a: (i: any) => any, b: (i: any) => any) => (arg: any) => b(a(arg));
    const pipe = (...ops: ((i: any) => any)[]) => ops.reduce(_pipe);

    const UDFName = this.methodName(definition.name);
    let ctx: any = null;

    const makeInputsObj = (...args: any[]) => {
      const defaults = definition.defaults || self.defaults.defaults || [];
      const inputs: any = {};
      for (const idx in params) {
        // if (!params[idx]) {
        //   throw new Error(`[${UDFName}] Either a parameter is missing or there are too many arguments (${args.length})`);
        // }
        if (args.length > +idx) {
          inputs[params[+idx]] = args[+idx];
        } else if (defaults.length > +idx) {
          inputs[params[+idx]] = defaults[+idx];
        } else {
          inputs[params[+idx]] = null;
        }
      }
      return inputs;
    };

    let api: BiotaBuilderMethodOutputAPI = {
      definition() {
        return definition;
      },
      context(ctxToUse) {
        ctx = ctxToUse;
        return api;
      },
      query(...args) {
        const inputs: any = makeInputsObj(...args);

        const beforeLet = typeof before === 'function' ? functionToExpresion(before, params as string[]) : {};
        const queryLet = typeof query === 'function' ? functionToExpresion(query, params as string[]) : {};
        const afterLet = typeof after === 'function' ? functionToExpresion(after, params as string[]) : {};

        const composition = [];

        composition.push(
          extend({
            data: {},
            ref: {},
            ...inputs,
            _inputs: inputs,
          }),
        );

        composition.push(
          extend([
            {
              ctx: context(ctx || (self.context as any)),
            },
            {
              ctx: {
                identity: q.Select('identity', q.Var('ctx'), null),
                session: q.Select('session', q.Var('ctx'), null),
                callstack: q.If(
                  q.IsString(UDFName),
                  q.Prepend(q.Select('callstack', q.Var('ctx'), []), [UDFName]), // #bug q.Format('%@', params)
                  q.Select('callstack', q.Var('ctx'), []),
                ),
                actions: q.Select('actions', q.Var('ctx'), []),
                errors: q.Select('errors', q.Var('ctx'), []),
                success: q.Select('success', q.Var('ctx'), true),
              },
            },
          ]),
        );

        if (Object.keys(beforeLet).length > 0) {
          composition.push(extend(beforeLet));
        }

        if (definition.annotate) {
          composition.push(
            extend({
              annotationName: definition.name,
              annotationData: q.Var('data'),
              annotationOutput: q.Var('data'),
            }),
          );
        }

        composition.push(
          extend({
            response: queryLet,
          }),
        );

        if (definition.action) {
          composition.push(
            extend({
              actionName: definition.name,
              actionUser: self.identity(q.Var('ctx')),
              actionRef: q.Var('ref'),
            }),
          );
        }

        if (Object.keys(afterLet).length > 0) {
          composition.push(extend(afterLet));
        }

        const expression = q.Let(
          {
            [`${UDFName}`]: pipe(...composition.reverse())({
              response: q.Var('response'),
              success: q.Select('success', q.Var('ctx'), true),
              actions: q.Select('actions', q.Var('ctx'), []),
              errors: q.Select('errors', q.Var('ctx'), []),
              ts: q.Now(),
            }),
          },
          q.Var(`${UDFName}`),
        );

        return expression;
      },
      copy(definitionPart) {
        return { ...definition, ...definitionPart };
      },
      udfName() {
        return UDFName;
      },
      udfParams() {
        return params;
      },
      udf() {
        const defaults = definition.defaults || self.defaults.defaults || [];
        return {
          name: UDFName,
          body: q.Query(
            q.Lambda(
              ['ctx', 'params'],
              api
                .context(ctx)
                .query(
                  ...params.map((param, idx) =>
                    q.Select(param, q.Var('params'), defaults.length > idx ? defaults[idx] : null),
                  ),
                ),
            ),
          ),
        };
      },
      scaffolds() {
        return scaffolds({ self: this });
      },
      call(...args) {
        const inputs: any = makeInputsObj(...args);
        // console.log("inputs", inputs);
        return q.Call(UDFName, {}, inputs);
      },
      callWithContext(...args) {
        const inputs: any = makeInputsObj(...args);
        return q.Call(UDFName, q.Var('ctx'), inputs);
      },
      callResponse(...args) {
        return q.Select('response', this.call(...args), {});
      },
      callResponseWithContext(...args) {
        return q.Select('response', this.callWithContext(...args), {});
      },
      response(...args) {
        return this.callResponseWithContext(...args);
      },
    };

    return api;
  }
}

export function scaffolds(definitions: BiotaBuilderDefinition | BiotaBuilderDefinitionKeyed): any[] {
  const isDefinition = (obj: any) => typeof obj.udf === 'function';
  const upsertUDF = (udfDefinition: any) =>
    q.If(
      q.Exists(q.Function(udfDefinition.name)),
      q.Replace(q.Function(udfDefinition.name), udfDefinition),
      q.CreateFunction(udfDefinition),
    );

  const queries = [];
  const dig = (defs: BiotaBuilderDefinition | BiotaBuilderDefinitionKeyed) => {
    for (const def of Object.values(defs) as BiotaBuilderMethodOutputAPI[]) {
      if (isDefinition(def)) {
        queries.push({
          name: def.udfName(),
          expression: upsertUDF(def.udf()),
        });
      } else if (typeof def === 'object') {
        dig(def);
      }
    }
  };

  dig(definitions);
  return queries;
}
