import { ExprVal, ExprArg } from 'faunadb';

export interface BiotaBuilderOptionsActionOptions {
  collection?: string;
}

export interface BiotaBuilderOptions {
  lib?: string;
  extension?: string;
  version?: string;
  path?: string;
  annotate?: string;
  action?: string;
  actionOptions?: BiotaBuilderOptionsActionOptions;
  identity?(ctx: ExprVal): ExprVal;
  context?: any;
  defaults?: BiotaBuilderDefinition;
}

export type BiotaBuilderDefinitionHandler<I = ExprVal, O = ExprVal> = (...args: I[]) => O;

export interface BiotaBuilderDefinition<I = ExprVal, O = ExprVal> {
  name?: string;
  defaults?: any[];
  params?: string[];
  before?: BiotaBuilderDefinitionHandler<I, O>;
  query?: BiotaBuilderDefinitionHandler<I, O>;
  after?: BiotaBuilderDefinitionHandler<I, O>;
  role?: string;
  context?(ctx: ExprVal): O;

  lib?: string;
  extension?: string;
  version?: string;
  path?: string;
  annotate?: string;
  action?: string;
  alias?: boolean;
}

export interface BiotaBuilderMethodOutputAPI {
  definition(): BiotaBuilderDefinition;
  context(ctx: ExprVal): BiotaBuilderMethodOutputAPI;
  query(...args: any[]): any;
  copy(definitionPart: BiotaBuilderDefinition): any;
  udf(): any; //FaunaUDFunctionOptions;
  udfName(): string;
  udfParams(): string[];
  scaffolds(): any;
  call(...args: any[]): ExprArg;
  callWithContext(...args: any[]): ExprArg;
  callResponse(...args: any[]): ExprArg;
  callResponseWithContext(...args: any[]): ExprArg;
  response(...args: any[]): ExprArg;
}

export interface BiotaBuilderMethodOutputAPIKeyed {
  [key: string]: BiotaBuilderMethodOutputAPI;
}

export interface BiotaBuilderDefinitionKeyed<O = ExprVal> {
  [key: string]: BiotaBuilderDefinition<O>;
}

export interface BiotaBuilderMethodResult {
  response: any;
  success: boolean;
  actions: any[];
  errors: any[];
  ts: number;
}

export interface BiotaBuilderActionApi {
  Log: BiotaBuilderMethodOutputAPI;
}
