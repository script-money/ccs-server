import { Provide, TaskLocal, Queue, Inject } from '@midwayjs/decorator';
import {
  closeActivity,
  createActivity,
  createVote,
  consumptionUpdated,
  rewardParameterUpdated,
} from '../orm/activity';
import { Config } from '@midwayjs/decorator';
import {
  LONG_INTERVAL,
  MID_INTERVAL,
  SHORT_INTERVAL,
  TaskUtils,
} from './utils';
import { ActivityService } from '../service/activity';

@Queue()
@Provide()
export class ActivityTask {
  contractName = 'ActivityContract';

  @Config('activityContract')
  contractAddr: string;

  @Config('shortQueryBlock')
  shortQueryBlock: number;

  @Config('maxRangeQueryBlock')
  maxRangeQueryBlock: number;

  @Config('closeActivityIntervalMinutes')
  closeActivityIntervalMinutes: number;

  @Inject()
  activityService: ActivityService;

  @Inject()
  taskUtils: TaskUtils;

  @TaskLocal(SHORT_INTERVAL)
  async activitiesUpdate() {
    const lastBlock = await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityCreated',
      createActivity,
      this.shortQueryBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityVoted',
      createVote,
      this.shortQueryBlock,
      lastBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'activityClosed',
      closeActivity,
      this.shortQueryBlock,
      lastBlock
    );
  }

  @TaskLocal(LONG_INTERVAL)
  async parameterUpdate() {
    const lastBlock = await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'consumptionUpdated',
      consumptionUpdated,
      this.maxRangeQueryBlock
    );

    await this.taskUtils.saveEventsToDB(
      this.contractAddr,
      this.contractName,
      'rewardParameterUpdated',
      rewardParameterUpdated,
      this.maxRangeQueryBlock,
      lastBlock
    );
  }

  @TaskLocal(MID_INTERVAL)
  async closeActivity() {
    await this.activityService.close(this.closeActivityIntervalMinutes);
  }
}
