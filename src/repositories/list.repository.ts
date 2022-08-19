import { randomUUID } from 'crypto';
import {
  List, prisma, Prisma, PrismaClient,
} from '@prisma/client';
import db from '../providers/db';
import { LIST_SPECIAL, LIST_SPECIAL_DESCRIPTORS } from '../constants';

export type ListWithRelations<T> = T & {
  users: { id: number }[],
  deals: { id: number }[],
};
class ListRepository {
  modelList: Prisma.ListDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  modelDeal: Prisma.DealDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  dbClient: PrismaClient;

  constructor(dbClient: PrismaClient) {
    this.dbClient = dbClient;

    this.modelList = dbClient.list;
    this.modelDeal = dbClient.deal;
  }

  getById(id: number): Promise<List> {
    return this.modelList.findUnique({
      where: {
        id,
      },
    });
  }

  getByGuid(guid: string): Promise<List> {
    return this.modelList.findFirst({
      where: {
        guid,
      },
    });
  }

  getAllByUserId(userId: number): Promise<ListWithRelations<List>[]> {
    return this.modelList.findMany({
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
        users: {
          select: { id: true },
        },
        deals: {
          where: {
            doneAt: null,
            deleted: false,
          },
          select: { id: true },
        },
      },
    });
  }

  async getOwners(listId: number): Promise<number[]> {
    const results = await this.modelList.findUnique({
      where: {
        id: listId,
      },
      select: {
        users: {
          select: { id: true },
        },
      },
    });

    return results.users.map((u) => u.id);
  }

  async addOwner(listId: number, userId: number) {
    return this.modelList.update({
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
    return this.modelList.update({
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
    const result = await this.modelList.findFirst({
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
    return this.modelList.create({
      data: {
        name,
        users: {
          connect: [{ id: userId }],
        },
      },
    });
  }

  async createSpecial(userId: number, specialId: string) {
    if (await this.modelList.count({
      where: {
        specialId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    }) === 0) {
      return this.modelList.create({
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

    return null;
  }

  delete(id: number) {
    const deleteDeals = this.modelDeal.deleteMany({
      where: {
        listId: id,
      },
    });
    const deleteList = this.modelList.delete({
      where: {
        id,
      },
    });

    return this.dbClient.$transaction([deleteDeals, deleteList]);
  }

  async updateGuid(id: number) {
    const guid = randomUUID();

    await this.modelList.update({
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
