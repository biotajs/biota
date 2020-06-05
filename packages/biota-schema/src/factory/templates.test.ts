import { client } from '../__test__/client';
import { templates, messages } from './templates';
import { Expr } from 'faunadb';

describe('TemplatesMessages', () => {
  const isItValid = (key: string, options: any = {}) => {
    const language = options.language || 'en';
    return test(`[${key}] message in language [${language}]`, () => {
      return client()
        .query(templates.Messages.response(key, options) as Expr)
        .then((response: any) => {
          expect(response).toEqual(messages[language][key]);
        })
        .catch(console.error);
    }, 10000);
  };

  Object.keys(messages).forEach((language) => {
    Object.keys(messages[language]).forEach((key) => isItValid(key, { language: language }));
  });
});
