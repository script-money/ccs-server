import { Rule, RuleType } from '@midwayjs/decorator';
import { userValidActivityTypeEnum } from '../interface/activity';
import { Address } from '../interface/flow';
// eslint-disable-next-line node/no-unpublished-import
import { ActivityType } from '../prisma/client';

export class ActivitiesGetDTO {
  @Rule(RuleType.number().max(10))
  limit?: number;

  @Rule(RuleType.number())
  offset?: number;

  @Rule(
    RuleType.any().valid(
      ...Object.keys(userValidActivityTypeEnum).filter(
        value => typeof value === 'string'
      )
    )
  )
  type?: ActivityType;

  @Rule(RuleType.bool())
  canVote?: boolean;

  @Rule(RuleType.string())
  address?: Address;

  @Rule(RuleType.bool())
  canJoin?: boolean;

  @Rule(RuleType.string())
  createBy?: string;
}
