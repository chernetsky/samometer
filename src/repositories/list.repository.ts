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
        deleted: false,
        users: {
          some: {
            id: userId,
          },
        },
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
        specialId: LIST_SPECIAL.TODAY,
        users: {
          every: {
            id: userId,
          },
        },
      },
    });

    return result?.id || null;
  }

  async getCurrentList(userId: number): Promise<List> {
    return this.model.findFirst({
      where: {
        specialId: LIST_SPECIAL.TODAY,
        users: {
          every: {
            id: userId,
          },
        },
      },
    });
  }

  async create(userId: number, data: { name: string }) {
    const { name } = data;
    return this.model.create({
      data: {
        name,
        users: {
          connect: [{ id: userId }],
        },
      },
    });
  }

  async createSpecialList(userId: number, specialId: string) {
    if (await this.model.count({
      where: {
        specialId, users: {
          every: {
            id: userId,
          },
        },
      },
    }) === 0) {
      return this.model.create({
        data: {
          specialId,
          name: LIST_SPECIAL_DESCRIPTORS[specialId].name,
          tracking: false, // По специальным спискам статистику не собираем
          users: {
            connect: [
              { id: userId },
            ],
          },
        },
      });
    }
  }
}

export default new ListRepository(db.client);
