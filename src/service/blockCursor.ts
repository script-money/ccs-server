import { Config, Inject, Provide } from '@midwayjs/decorator';
// eslint-disable-next-line node/no-unpublished-import
import { PrismaClient } from '../prisma/client';
import { FlowService } from './flow';

@Provide()
export class BlockCursorService {
  @Inject('prisma')
  prismaClient: PrismaClient;

  @Config('startHeight')
  startHeight: number;

  @Inject()
  flowService: FlowService;

  async findOrCreateLatestBlockCursor(eventName: string) {
    let blockCursor = await this.prismaClient.blockCursor.findFirst({
      where: {
        eventName,
      },
    });

    if (!blockCursor) {
      blockCursor = await this.prismaClient.blockCursor.create({
        data: {
          eventName,
          currentHeight:
            this.startHeight ?? (await this.flowService.getLatestBlockHeight()),
        },
      });
    }
    return blockCursor;
  }

  async updateBlockCursorById(id: number, currentBlockHeight: number) {
    await this.prismaClient.blockCursor.update({
      where: {
        id: id,
      },
      data: {
        currentHeight: currentBlockHeight,
      },
    });
  }
}
