import { Prisma, PrismaClient } from '@prisma/client';
import db from '../providers/db';

class DealRepository {
  dealModel: Prisma.DealDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.dealModel = dbClient.deal;
  }

  async getAllByListId(listId: number) {
    return this.dealModel.findMany({
      where: { listId, deleted: false },
      orderBy: [
        { createdAt: 'asc' },
        { name: 'asc' },
      ],
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

  deleteDone(listId: number) {
    return this.dealModel.deleteMany({
      where: {
        listId,
        doneAt: { not: null },
      },
    });
  }
}

export default new DealRepository(db.client);
