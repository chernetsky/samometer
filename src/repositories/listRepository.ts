import db from '../providers/db';
import { List, Prisma, PrismaClient } from '@prisma/client';
import { LIST_SPECIAL, LIST_SPECIAL_DESCRIPTORS } from '../constants';

class ListRepository {
  listModel: Prisma.ListDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.listModel = dbClient.list;
  }

  async getCurrentList(userId: number): Promise<List> {
    return this.listModel.findFirst({
      where: {
        userId,
        specialId: LIST_SPECIAL.TODAY,
      },
    });
  }

  async createSpecialList(userId: number, specialId: string) {
    if (await this.listModel.count({ where: { userId, specialId } }) === 0) {
      // console.log(`Create special list ${specialId} for ${userId}`);
      return this.listModel.create({
        data: {
          userId,
          specialId,
          name: LIST_SPECIAL_DESCRIPTORS[specialId].name,
          tracking: false, // По специальным спискам статистику не собираем
        },
      });
    }
  }
}

export default new ListRepository(db.client);
