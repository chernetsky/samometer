import db from '../providers/db';
import { List, Prisma, PrismaClient } from '@prisma/client';
import { LIST_SPECIAL, LIST_SPECIAL_DESCRIPTORS } from '../constants';

class UserRepository {
  model: Prisma.UserDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.model = dbClient.user;
  }

  upsert(from: { id: number, username: string }) {
    const { id, username } = from;
    return this.model.upsert({
      where: { id },
      update: { username },
      create: { id, username },
    });
  }
}

export default new UserRepository(db.client);
