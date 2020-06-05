import { deploy as buiderDeploy } from '@biota/builder';
import { factory as constantsFactory } from '@biota/constants';
import { factory as helpersFactory } from '@biota/helpers';
import * as factory from './factory';

export async function deploy(secret: string, { retry = 8 }: { retry?: number } = {}) {
  return buiderDeploy(secret, [factory, constantsFactory, helpersFactory], { retry });
}
