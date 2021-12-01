import { Prisma, PrismaClient } from '@prisma/client';

class DbProvider {
  prisma: PrismaClient;

  constructor({ client }) {
    this.prisma = new client({
      // log: ['query']
    });
  }

  get client() {
    return this.prisma;
  }

  get listModel(): Prisma.ListDelegate<any> {
    return this.prisma.list;
  }
}

export default new DbProvider({ client: PrismaClient });
