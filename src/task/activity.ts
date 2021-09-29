import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import {
  closeActivity,
  createActivity,
  createVote,
  consumptionUpdated,
  rewardParameterUpdated,
} from '../orm/activity';
import { Config } from '@midwayjs/decorator';
import { TaskUtils } from './utils';

@Queue()
@Provide()
export class ActivityTask {
  contractName = 'ActivityContract';

  @Config('activityContract')
  contractAddr: string;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal('* * * * *') // every minitus
  async activitiesUpdate() {
    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityCreated',
      createActivity
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityVoted',
      createVote
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityClosed',
      closeActivity
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
