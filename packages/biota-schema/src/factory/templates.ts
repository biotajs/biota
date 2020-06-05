import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';

export const messages = {
  fr: {
    _default_identifier: `Il`,
    _field_identifier: `Le champs '{field}'`,
    required: '{identifier} est requis.',

    allof_none: `{identifier} ne correspond à aucune des règles.`,

    anyof_none: `{identifier} ne correspond à aucune règle.`,

    oneof_too_many: '{identifier} correspond à plusieurs règles.',
    oneof_none: `{identifier} ne correspond à aucune règle.`,

    string: '{identifier} doit être de type texte.',
    string_convert: `{identifier} ne peut pas être converti en texte.`,
    string_empty: '{identifier} doit être vide.',
    string_non_empty: '{identifier} doit être non-vide.',
    string_min: '{identifier} doit être plus grand ou égal à {expected} caractères.',
    string_max: '{identifier} doit être plus petit à {expected} caractères.',
    string_length: '{identifier} doit être composé de {expected} caractères.',
    string_pattern: '{identifier} ne correspond pas au modèle (regex).',
    string_contains: "{identifier} doit contenir le segment '{expected}'.",
    string_enum: '{identifier} ne correspond à aucune des valeurs autorisées.',
    string_numeric: '{identifier} doit être un texte contenant un nombre.',
    string_alpha: `{identifier} doit être un texte contenant uniquement l'alphabet.`,
    string_alphanum: `{identifier} doit être un texte contenant uniquement l'alphabets et/ou des chiffres'.`,
    string_alphadash: `{identifier} doit être un texte contenant uniquement l'alphabets et/ou _'.`,
    string_starts_with: "{identifier} doit commencer par '{expected}'.",
    string_ends_with: "{identifier} doit terminer par '{expected}'.",

    number: '{identifier} doit être un nombre.',
    number_convert: `{identifier} ne peut pas être converti en nombre.`,
    number_min: '{identifier} doit être plus grand ou égal à {expected}.',
    number_max: '{identifier} doit être plus petit à {expected}.',
    number_equal: '{identifier} doit être égal à {expected}.',
    number_non_equal: '{identifier} ne doit pas être égal à {expected}.',
    number_integer: '{identifier} doit être un nombre entier.',
    number_double: `{identifier} doit être un nombre de type 'double'.`,
    number_positive: '{identifier} doit être un nombre positif.',
    number_negative: '{identifier} doit être un nombre négatif.',

    array: '{identifier} doit être une liste.',
    array_items: '{identifier} doit avoir des élements corrects.',
    array_empty: '{identifier} doit être vide.',
    array_non_empty: '{identifier} ne doit pas être vide.',
    array_min: '{identifier} doit contenir au moins {expected} élements.',
    array_max: '{identifier} doit contenir autant ou plus de {expected} élements.',
    array_includes: "{identifier} ne continent pas l'élément requis.",
    array_unique: '{identifier} contient des doublons.',
    array_enum: '{identifier} ne contient pas de valeur autorisée.',
    array_count: "{identifier} doit contenir '{expected}' éléments mais en contient '{actual}'.",

    boolean: '{identifier} doit être un booléen.',

    date: '{identifier} doit être une Date.',
    date_from: '{identifier} doit être plus grand ou égal à {expected}.',
    date_to: '{identifier} doit être plus petit que {expected}.',

    object: '{identifier} doit être un objet.',
    object_forbidden_key: "{identifier} contient une propriété non-authorisée: '{actual}'.",
    object_missing_key: "{identifier} a une propriété manquante: '{actual}'.",
    object_properties: `{identifier} a des propriétés érroné.`,

    document: '{identifier} doit être un document valide.',
    database: '{identifier} doit être une base de donnée valide.',
    collection: '{identifier} doit être une collection valide.',
    bytes: '{identifier} doit être une séquence de bits.',
    credentials: '{identifier} doit être des identifiants.',
    lambda: '{identifier} doit être un lambda.',
    function: '{identifier} doit être une fonction.',
    index: '{identifier} doit être un indexe.',
    null: '{identifier} doit être nul.',
    key: '{identifier} doit être une clé.',
    role: '{identifier} doit role.',
    set: '{identifier} doit être un set valide.',
    time: '{identifier} doit être une heure valide.',
    token: '{identifier} doit être un jeton valide.',

    reference: '{identifier} doit être une référence.',
    reference_exists: '{identifier} doit exister.',

    udfunction_missing_for_test: `Une 'User-Defined Function' est manquante pour la propriété: '{expected}'.`,
  },
  en: {
    _default_identifier: `It`,
    _field_identifier: `The '{field}' field`,
    required: '{identifier} is required.',

    allof_none: `{identifier} doesn't match with all the rules.`,

    anyof_none: `{identifier} doesn't match any rule.`,

    oneof_too_many: '{identifier} matches more than one rule.',
    oneof_none: `{identifier} doesn't match even one rule.`,

    string: '{identifier} must be a string.',
    string_convert: `{identifier} can't be converted to string.`,
    string_empty: '{identifier} must be empty.',
    string_non_empty: '{identifier} must be non-empty.',
    string_min: '{identifier} must be greater than or equal to {expected} characters long.',
    string_max: '{identifier} must be less than {expected} characters long.',
    string_length: '{identifier} must be {expected} characters long.',
    string_pattern: '{identifier} fails to match the required pattern.',
    string_contains: "{identifier} must contain the '{expected}' text.",
    string_enum: '{identifier} does not match any of the allowed values.',
    string_numeric: '{identifier} must be a numeric string.',
    string_alpha: '{identifier} must be an alphabetic string.',
    string_alphanum: '{identifier} must be an alphanumeric string.',
    string_alphadash: '{identifier} must be an alphadash string.',
    string_starts_with: "{identifier} must start with '{expected}'.",
    string_ends_with: "{identifier} must end with '{expected}'.",

    number: '{identifier} must be a number.',
    number_convert: `{identifier} can't be converted to number.`,
    number_min: '{identifier} must be greater than or equal to {expected}.',
    number_max: '{identifier} must be less than or equal to {expected}.',
    number_equal: '{identifier} must be equal to {expected}.',
    number_non_equal: "{identifier} can't be equal to {expected}.",
    number_integer: '{identifier} must be an integer number.',
    number_double: `{identifier} must be a 'double' number.`,
    number_positive: '{identifier} must be a positive number.',
    number_negative: '{identifier} must be a negative number.',

    array: '{identifier} must be an array.',
    array_items: '{identifier} must have valid items.',
    array_empty: '{identifier} must be an empty array.',
    array_non_empty: '{identifier} must be a non-empty array.',
    array_min: '{identifier} must contain at least {expected} items.',
    array_max: '{identifier} must contain less than or equal to {expected} items.',
    array_includes: '{identifier} must include the given item.',
    array_unique: '{identifier} contains same values twice or more.',
    array_enum: "{identifier} does't not contain a valid value.",
    array_count: "{identifier} must contain '{expected}' items but contains '{actual}'.",

    boolean: '{identifier} must be a boolean.',

    date: '{identifier} must be a Date.',
    date_from: '{identifier} must be greater than or equal to {expected}.',
    date_to: '{identifier} must be less than or equal to {expected}.',

    object: '{identifier} must be an Object.',
    object_forbidden_key: "{identifier} contains a forbidden key: '{actual}'.",
    object_missing_key: "{identifier} has a missing key: '{actual}'.",
    object_properties: '{identifier} has no valid properties.',

    document: '{identifier} must be a valid document.',
    database: '{identifier} must be a valid database.',
    collection: '{identifier} must be a valid collection.',
    bytes: '{identifier} must be a valid sequence of bytes.',
    credentials: '{identifier} must be valid credentials.',
    lambda: '{identifier} must be a valid lambda.',
    function: '{identifier} must be a valid function.',
    index: '{identifier} must be a valid index.',
    null: '{identifier} must be null.',
    key: '{identifier} must be a valid key.',
    role: '{identifier} must be a valid role.',
    set: '{identifier} must be a valid set.',
    time: '{identifier} must be a valid time.',
    token: '{identifier} must be a valid token.',

    reference: '{identifier} must be a reference.',
    reference_exists: '{identifier} must exists.',

    udfunction_missing_for_test: `A User-Defined Function is missing for the definition property '{expected}'.`,
  },
};

const build = new Builder({ lib: 'biota.schema', version: packagejson.version, path: 'templates' });
export const templates: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Messages: {
    name: 'Messages',
    params: ['key', 'options', 'keyValues'],
    defaults: [null, {}, {}],
    query(key, options, keyValues) {
      return q.Let(
        {
          defaultLanguage: q.Select('defaultLanguage', options, 'en'),
          language: q.Select('language', options, q.Var('defaultLanguage')),
          messages,
        },
        helpers.FillTemplate.response(
          q.If(
            q.Contains([q.Var('language'), key], q.Var('messages')),
            q.Select([q.Var('language'), key], q.Var('messages')),
            q.Select([q.Var('defaultLanguage'), key], q.Var('messages'), ''),
          ),
          keyValues,
        ),
      );
    },
  }
});
