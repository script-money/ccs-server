import prisma from './clientForTest';

/**
 * get user basic information
 * @param address user Flow address
 * @returns user
 */
export const getUser = async (address: string) => {
  return await prisma.user.findUnique({
    where: {
      address,
    },
  });
};
