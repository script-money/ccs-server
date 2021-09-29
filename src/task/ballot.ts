import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import { createBallotBought } from '../orm/ballot';
import { Config } from '@midwayjs/decorator';
import { TaskUtils } from './utils';

@Queue()
@Provide()
export class BallotTask {
  contractName = 'BallotContract';

  @Config('ballotContract')
  contractAddr: string;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal('* * * * *') // every minitus
  async ballotsBought() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'ballotsBought',
      createBallotBought
    );
  }
}
