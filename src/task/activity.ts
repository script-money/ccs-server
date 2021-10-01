import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import {
  closeActivity,
  createActivity,
  createVote,
  consumptionUpdated,
  rewardParameterUpdated,
} from '../orm/activity';
import { Config } from '@midwayjs/decorator';
import { SHORT_INTERVAL, TaskUtils } from './utils';

@Queue()
@Provide()
export class ActivityTask {
  contractName = 'ActivityContract';

  @Config('activityContract')
  contractAddr: string;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(SHORT_INTERVAL)
  async activitiesUpdate() {
    const lastBlock = await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityCreated',
      createActivity
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityVoted',
      createVote,
      lastBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityClosed',
      closeActivity,
      lastBlock
    );
  }

  @TaskLocal('0 0 * * *') // every day 00:00
  async parameterUpdate() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'consumptionUpdated',
      consumptionUpdated
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'rewardParameterUpdated',
      rewardParameterUpdated
    );
  }
}
