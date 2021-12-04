import db from '../providers/db';
import { Deal, Prisma, PrismaClient } from '@prisma/client';

class DealRepository {
  dealModel: Prisma.DealDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.dealModel = dbClient.deal;
  }

  async getDealsByListId(listId: number) {
    return this.dealModel.findMany({
      where: { listId, deleted: false },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async addDeal(dealData: { name: string, listId: number }) {
    const { name, listId } = dealData;
    return this.dealModel.create({
      data: {
        name,
        listId,
      },
    });
  }

  async changeDone(dealId: number, done: boolean) {
    return this.dealModel.update({
      where: {
        id: dealId,
      },
      data: {
        doneAt: done ? new Date() : null,
      },
    });
  }
}

export default new DealRepository(db.client);
