import db from '../providers/db';
import { List, Prisma, PrismaClient } from '@prisma/client';
import { LIST_SPECIAL, LIST_SPECIAL_DESCRIPTORS } from '../constants';

class ListRepository {
  model: Prisma.ListDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.model = dbClient.list;
  }

  async getListById(id: number): Promise<List> {
    return this.model.findUnique({
      where: {
        id,
      },
    });
  }

  async getListsByUserId(userId: number): Promise<List[]> {
    return this.model.findMany({
      where: {
        userId,
        deleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getCurrentListId(userId: number): Promise<number | null> {
    const result = await this.model.findFirst({
      select: { id: true },
      where: {
        userId,
        specialId: LIST_SPECIAL.TODAY,
      },
    });

    return result?.id || null;
  }

  async getCurrentList(userId: number): Promise<List> {
    return this.model.findFirst({
      where: {
        userId,
        specialId: LIST_SPECIAL.TODAY,
      },
    });
  }

  async create(data: { name: string, userId: number }) {
    const { name, userId } = data;
    return this.model.create({
      data: {
        name,
        userId,
      },
    });
  }

  async createSpecialList(userId: number, specialId: string) {
    if (await this.model.count({ where: { userId, specialId } }) === 0) {
      return this.model.create({
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
