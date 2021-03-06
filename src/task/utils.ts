import { Inject, Provide } from '@midwayjs/decorator';
import { BlockCursorService } from '../service/blockCursor';
import { FlowService } from '../service/flow';
import * as fcl from '@onflow/fcl';
import { Event } from '../interface/flow';

export const SHORT_INTERVAL = '*/20 * * * * *'; // every 20 seconds
export const MID_INTERVAL = '*/3 * * * *'; // every 3 minutes
export const LONG_INTERVAL = '0 0 * * *'; // every day 0:00

@Provide()
export class TaskUtils {
  @Inject()
  flowService: FlowService;

  @Inject()
  blockCursorService: BlockCursorService;

  /**
   * Listening for events and calling specific orm functions
   * @param contractAddr address of contract
   * @param contractName name of contract
   * @param eventName eventname of contract
   * @param ormFunction orm funtion to call
   * @param queryBlockRange: get events range per request
   * @param lastBlock?: if lastBlock is set, jump request height from blockchain
   * @returns Promise<number> last block
   */
  async saveEventsToDB(
    contractAddr: string,
    contractName: string,
    eventName: string,
    ormFunction: (evenData: any) => Promise<any>,
    queryBlockRange: number,
    lastBlock?: number
  ): Promise<number> {
    const blockCursor =
      await this.blockCursorService.findOrCreateLatestBlockCursor(eventName);
    const initStartBlock = blockCursor.currentHeight;
    if (!lastBlock) {
      lastBlock = await this.flowService.getLatestBlockHeight();
    }
    const interval = lastBlock - initStartBlock;

    if (interval < 0) {
      console.warn(
        'Cursor.height is greater than block height, run `npx prisma migrate reset` first'
      );
      return;
    }

    const epoch = Math.floor(interval / queryBlockRange);
    if (epoch === 0) {
      // console.log(`interval is ${interval}, wait for next query`);
      return;
    }

    // if block behind a lot, should send N blocks per request to catch up
    for (const i of [...Array(epoch).keys()]) {
      const queryEndAt = initStartBlock + (i + 1) * queryBlockRange;
      try {
        const result = await this.flowService.getEvents({
          contractAddr: fcl.sansPrefix(contractAddr),
          contractName,
          eventName,
          endBlock: Math.min(queryEndAt, lastBlock),
        });

        if (result !== undefined && result.length !== 0) {
          result.forEach(async (event: Event) => {
            console.log(`save ${ormFunction.name} event to db`, event.data);
            await ormFunction(event.data);
          });
        }
      } catch (error) {
        console.warn(error);
        continue;
      }
    }
    return lastBlock;
  }
}
