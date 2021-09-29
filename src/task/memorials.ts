import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { Config } from '@midwayjs/decorator';
import { TaskUtils } from './utils';
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

  @TaskLocal('* * * * *') // every minitus
  async memorialsUpdate() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'memorialMinted',
      createMemorial
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'Withdraw',
      withDrawMemorials
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'Deposit',
      depositMemorials
    );
  }
}
