import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { createBallotBought } from '../orm/ballot';
import { Config } from '@midwayjs/decorator';
import { SHORT_INTERVAL, TaskUtils } from './utils';

@Queue()
@Provide()
export class BallotTask {
  contractName = 'BallotContract';

  @Config('ballotContract')
  contractAddr: string;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(SHORT_INTERVAL)
  async ballotsBought() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'ballotsBought',
      createBallotBought
    );
  }
}
