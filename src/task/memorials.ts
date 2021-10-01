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

  @Config('Memorials')
  contractAddr: string;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(MID_INTERVAL)
  async memorialsUpdate() {
    const lastBlock = await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'memorialMinted',
      createMemorial
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'Withdraw',
      withDrawMemorials,
      lastBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'Deposit',
      depositMemorials,
      lastBlock
    );
  }
}
