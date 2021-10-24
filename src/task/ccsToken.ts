import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { tokenAirdrop } from '../orm/CCSToken';
import { Config } from '@midwayjs/decorator';
import { LONG_INTERVAL, TaskUtils } from './utils';

@Queue()
@Provide()
export class CCSTokenTask {
  contractName = 'CCSToken';

  @Config('CCSToken')
  contractAddr: string;

  @Config('maxRangeQueryBlock')
  maxRangeQueryBlock: number;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(LONG_INTERVAL) // every day
  async CCSTokensAirdrop() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'TokenAirdrop',
      tokenAirdrop,
      this.maxRangeQueryBlock
    );
  }
}
