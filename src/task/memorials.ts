import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { Config } from '@midwayjs/decorator';
import { MID_INTERVAL, TaskUtils } from './utils';
import {
  createMemorial,
  depositMemorials,
  withDrawMemorials,
} from '../orm/momerials';

@Queue()
@Provide()
export class MemorialsTask {
  contractName = 'Memorials';

  @Config('memorials')
  contractAddr: string;

  @Config('midRangeQueryBlock')
  midRangeQueryBlock: number;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(MID_INTERVAL)
  async memorialsUpdate() {
    const lastBlock = await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'memorialMinted',
      createMemorial,
      this.midRangeQueryBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'Withdraw',
      withDrawMemorials,
      this.midRangeQueryBlock,
      lastBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'Deposit',
      depositMemorials,
      this.midRangeQueryBlock,
      lastBlock
    );
  }
}
