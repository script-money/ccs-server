import { Config, Inject, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';
import httpStatus from 'http-status';
import {
  ICCSTokenService,
  IRequestFreeTokenResponse,
} from '../interface/ccsToken';
import {
  getHistory as getFacuetHistory,
  addFacuetRecord as addFacuetRecordToDB,
} from '../orm/ccsToken';
import { FlowService } from './flow';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { Address } from '../interface/flow';

export const toUFix64 = (value: number) => value.toFixed(8);

@Provide()
export class ccsTokenService implements ICCSTokenService {
  @Inject()
  ctx: Context;

  @Inject()
  flowService: FlowService;

  @Config('fungibleToken')
  fungibleToken: Address;

  @Config('CCSToken')
  CCSToken: Address;

  @Config('facuetAmount')
  facuetAmount: number;

  async requestFree(addr: string): Promise<IRequestFreeTokenResponse> {
    try {
      const result = await getFacuetHistory(addr);
      if (result !== null) {
        return {
          success: true,
          data: result,
          errorCode: httpStatus.ACCEPTED,
          errorMessage: 'user already request free tokens',
          showType: 1,
        };
      }

      const txResult = await this.flowService.sendTxByAdmin({
        path: 'CCSToken/mint_tokens_and_distribute.cdc',
        args: [
          fcl.arg(
            [{ key: addr, value: toUFix64(this.facuetAmount) }],
            t.Dictionary({ key: t.Address, value: t.UFix64 })
          ),
        ],
      });

      if (txResult) {
        await addFacuetRecordToDB(addr);
        return {
          success: true,
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        errorCode: httpStatus.ACCEPTED,
        errorMessage: error.toString().split('\n')[1],
        showType: 1,
      };
    }
  }
}
