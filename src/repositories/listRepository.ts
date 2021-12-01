import db from '../providers/db';
import { Prisma, PrismaClient } from '@prisma/client';
import { LIST_SPECIAL_DESCRIPTORS } from '../constants';

class ListRepository {
  listModel: Prisma.ListDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.listModel = dbClient.list;
  }

  async createSpecialList(userId: number, specialId: string) {
    if (await this.listModel.count({ where: { userId, specialId } }) === 0) {
      // console.log(`Create special list ${specialId} for ${userId}`);
      return this.listModel.create({
        data: {
          userId,
          specialId,
          name: LIST_SPECIAL_DESCRIPTORS[specialId].name,
        },
      });
    }
  }
}

export default new ListRepository(db.client);
