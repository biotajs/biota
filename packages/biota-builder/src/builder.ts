import {
  BiotaBuilderDefinition,
  BiotaBuilderDefinitionHandler,
  BiotaBuilderDefinitionKeyed,
  BiotaBuilderMethodOutputAPI,
  BiotaBuilderMethodOutputAPIKeyed,
  BiotaBuilderOptions,
  BiotaBuilderOptionsActionOptions,
} from './types/builder';
import { ExprVal, query as q } from 'faunadb';
import packagejson from './../package.json';

function functionToExpresion(this: any, fn: BiotaBuilderDefinitionHandler, params: string[] = []) {
  return fn.apply(
    this,
    params.map((param: string) => q.Var(param)),
  );
}

export class Builder {
  lib?: string;
  extension?: string;
  version?: string;
  path: string;
  annotate: string;
  action: string;
  actionOptions: BiotaBuilderOptionsActionOptions;
  context: any;
  defaults: BiotaBuilderDefinition;

  constructor(options?: BiotaBuilderOptions) {
    const {
      annotate = null,
      action = null,
      lib = null,
      extension = null,
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
    this.extension = extension;
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

  methodName(options: BiotaBuilderDefinition = {}) {
    options.path = options.path || this.path;
    options.lib = options.lib || this.lib;
    options.extension = options.extension || this.extension;
    options.version = options.version || this.version || '';
    const list = typeof options.path === 'string' && options.path.length > 0 ? options.path.split('.') : [];
    if (options.name) list.push(options.name);
    const libVersionned = options.lib ? options.lib + '@' + options.version : '';
    const fnName = list.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    return (options.lib ? `${libVersionned}+${fnName}` : fnName) + (options.extension ? options.extension : '');
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
    // const methods = [before, query, after].filter((f) => typeof f === 'function');
    const params: string[] = definition.params || this.defaults.params || [];

    const extend = (bindings: Object) => (next: ExprVal) => q.Let(bindings, next);

    const _pipe = (a: (i: any) => any, b: (i: any) => any) => (arg: any) => b(a(arg));
    const pipe = (...ops: ((i: any) => any)[]) => ops.reduce(_pipe);

    const UDFName = this.methodName(definition);
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
            annotate: {}, // default for annotate()
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
              annotationName: definition.annotate,
              annotationData: q.Var('data'),
              annotationInputs: q.Var('annotate'),
              data: q.Select(
                'response',
                q.Call(`biota.builder@${packagejson.version}+Annotate`, q.Var('ctx'), {
                  action: q.Var('annotationName'),
                  data: q.Var('annotationData'),
                  input: q.Var('annotationInputs'),
                }),
                {},
              ),
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
              actionName: definition.action,
              // ab: q.Abort(q.Format('%@', { actionName: q.Var('actionName'), ref: q.Var('ref') })),
              actionRef: q.Select('ref', q.Var('response'), null),
              data: q.If(
                q.Not(q.IsNull(q.Var('actionRef'))),
                q.Select(
                  'response',
                  q.Call(`biota.builder@${packagejson.version}+ActionLog`, q.Var('ctx'), {
                    name: q.Var('actionName'),
                    instance: q.Var('actionRef'),
                  }),
                  {},
                ),
                '',
              ),
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

export function scaffolds(
  definitions: BiotaBuilderDefinition | BiotaBuilderDefinitionKeyed,
  createOnly = false,
): any[] {
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
          expression: createOnly ? q.CreateFunction(def.udf()) : upsertUDF(def.udf()),
        });
      } else if (typeof def === 'object') {
        dig(def);
      }
    }
  };

  dig(definitions);
  return queries;
}
