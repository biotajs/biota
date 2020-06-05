import { deploy as buiderDeploy } from '@biota/builder';
import { factory as schema } from '@biota/schema';
import { factory as error } from '@biota/error';
import { factory as helpers } from '@biota/helpers';
import * as factory from './factory';

export async function deploy(secret: string, { retry = 8 }: { retry?: number } = {}) {
  return buiderDeploy(secret, [factory, helpers, schema, error], { retry });
}
