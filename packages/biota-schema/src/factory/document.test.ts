import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { document } from './document';

describe('DocumentValidate', () => {
  const isItValid = isItValidAndNotSanitized(document);

  isItValid(`[document] is document`, values.document);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(
      ([key]) =>
        !key.startsWith('document') &&
        !['collection', 'document', 'index', 'key', 'role', 'token', 'reference', 'database'].includes(key) &&
        !['null'].includes(key),
    )
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not document`, value, {}, false);
    });
});
