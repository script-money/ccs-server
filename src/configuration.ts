import { App, Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayApplication } from '@midwayjs/core';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as task from '@midwayjs/task';
// eslint-disable-next-line node/no-unpublished-import
import { PrismaClient } from './prisma/client';

// Prisma require env variables
dotenv.config();

const client = new PrismaClient();

@Configuration({
  imports: [task],
  importConfigs: ['./config'],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  async onReady(): Promise<void> {
    client.$connect();
    console.log(chalk.greenBright('[ Prisma ] Prisma Client Connected'));
    this.app.getApplicationContext().registerObject('prisma', client);
    console.log(chalk.greenBright('[ Prisma ] Prisma Client Injected'));
  }

  async onStop(): Promise<void> {
    client.$disconnect();
  }
}
