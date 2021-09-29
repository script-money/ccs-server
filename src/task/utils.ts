import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BlockCursorService } from '../service/blockCursor';
import { FlowService } from '../service/flow';
import * as fcl from '@onflow/fcl';
import { Event } from '../interface/flow';

@Provide()
export class TaskUtils {
  @Config('maxQueryBlock')
  maxQueryBlock: number;

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
   * @returns Promise<any>
   */
  async saveEventsToDB(
    contractAddr: string,
    contractName: string,
    eventName: string,
    ormFunction: (evenData: any) => Promise<any>
  ) {
    const blockCursor =
      await this.blockCursorService.findOrCreateLatestBlockCursor(eventName);
    const initStartBlock = blockCursor.currentHeight;
    const lastBlock = await this.flowService.getLatestBlockHeight();
    const interval = lastBlock - initStartBlock;

    if (interval < 0) {
      console.warn(
        'Cursor.height is greater than block height, run `npx prisma migrate reset` first'
      );
      return;
    }

    const epoch = Math.floor(interval / this.maxQueryBlock);
    if (epoch === 0) {
      console.log(`interval is ${interval}, wait for next query`);
      return;
    }

    // if block behind a lot, should send N blocks per request to catch up
    for (const i of [...Array(epoch).keys()]) {
      const queryEndAt = initStartBlock + (i + 1) * this.maxQueryBlock;

      const result = await this.flowService.getEvents({
        contractAddr: fcl.sansPrefix(contractAddr),
        contractName,
        eventName,
        endBlock: Math.min(queryEndAt, lastBlock),
      });

      if (result !== undefined && result.length !== 0) {
        result.forEach(async (event: Event) => {
          console.log(`save ${event.data} to database`);
          await ormFunction(event.data);
        });
      }
    }
  }
}
