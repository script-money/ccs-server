import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { createBallotBought } from '../orm/ballot';
import { Config } from '@midwayjs/decorator';
import { SHORT_INTERVAL, TaskUtils } from './utils';
import { addUser } from '../orm/user';

@Queue()
@Provide()
export class BallotTask {
  contractName = 'BallotContract';

  @Config('ballotContract')
  contractAddr: string;

  @Config('shortQueryBlock')
  shortQueryBlock: number;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(SHORT_INTERVAL)
  async ballotsUpdate() {
    const lastBlock = await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'ballotPrepared',
      addUser,
      this.shortQueryBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'ballotsBought',
      createBallotBought,
      this.shortQueryBlock,
      lastBlock
    );
  }
}
