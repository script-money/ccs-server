import { Rule, RuleType } from '@midwayjs/decorator';
import { Address } from '../interface/flow';

export class MemorialsGetDTO {
  @Rule(RuleType.number())
  activityId?: number;

  @Rule(RuleType.string())
  userAddress?: Address;
}
