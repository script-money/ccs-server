import prisma from './clientForTest';
import {
  ITokenAirdropFromEvent,
  IGetTokenChangeRecordsOptions,
} from '../../src/interface/ccsToken';

/**
 * create token airdrop record from event
 * @param eventData token airdrop event
 */
export const tokenAirdrop = async (eventData: ITokenAirdropFromEvent) => {
  await prisma.tokenChangeRecord.create({
    data: {
      type: 'Airdrop',
      amount: +eventData.amount,
      user: {
        connectOrCreate: {
          where: {
            address: eventData.receiver,
          },
          create: {
            address: eventData.receiver,
          },
        },
      },
      comment: `Recieve ${eventData.amount} $CCS airdrop`,
    },
  });
};

/**
 * get token change records
 * @param options query option
 * @returns TokenChangeRecord[]
 */
export const getTokenChangeRecords = async (
  options: IGetTokenChangeRecordsOptions
) => {
  const { user, skip, take } = options;
  return await prisma.tokenChangeRecord.findMany({
    skip,
    take,
    where: {
      userAddress: user,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
