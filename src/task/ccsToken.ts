import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { tokenAirdrop } from '../orm/CCSToken';
import { Config } from '@midwayjs/decorator';
import { TaskUtils } from './utils';

@Queue()
@Provide()
export class CCSTokenTask {
  contractName = 'CCSToken';

  @Config('CCSToken')
  contractAddr: string;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal('0 0 * * *') // every day
  async CCSTokensAirdrop() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'TokenAirdrop',
      tokenAirdrop
    );
  }
}
