import { randomUUID } from 'crypto';
import db from '../providers/db';
import { List, Prisma, PrismaClient } from '@prisma/client';
import { LIST_SPECIAL, LIST_SPECIAL_DESCRIPTORS } from '../constants';

export type ListWithCounts<T> = T & {
  _count: {
    users: number,
    deals: number,
  },
};
class ListRepository {
  model: Prisma.ListDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.model = dbClient.list;
  }

  getById(id: number): Promise<List> {
    return this.model.findUnique({
      where: {
        id,
      },
    });
  }

  getByGuid(guid: string): Promise<List> {
    return this.model.findFirst({
      where: {
        guid,
      },
    });
  }

  getAllByUserId(userId: number): Promise<ListWithCounts<List>[]> {
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
      include: {
        _count: {
          select: {
            users: true,
            deals: true,
          },
        },
      },
    });
  }

  async getOwners(listId: number): Promise<number[]> {
    const results = await this.model.findUnique({
      where: {
        id: listId,
      },
      select: {
        users: {
          select: { id: true },
        },
      },
    });

    return results.users.map(u => u.id);
  }

  async addOwner(listId: number, userId: number) {
    return this.model.update({
      where: { id: listId },
      data: {
        users: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async removeOwner(listId: number, userId: number) {
    return this.model.update({
      where: { id: listId },
      data: {
        users: {
          disconnect: {
            id: userId,
          },
        },
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async getCurrentId(userId: number): Promise<number | null> {
    const result = await this.model.findFirst({
      select: { id: true },
      where: {
        specialId: LIST_SPECIAL.TODAY,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    return result?.id || null;
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

  async createSpecial(userId: number, specialId: string) {
    if (await this.model.count({
      where: {
        specialId,
        users: {
          some: {
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

  setDeleted(id: number) {
    return this.model.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });
  }

  async updateGuid(id: number) {
    const guid = randomUUID();

    await this.model.update({
      where: {
        id,
      },
      data: {
        guid,
      },
    });

    return guid;
  }
}

export default new ListRepository(db.client);
