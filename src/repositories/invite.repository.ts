import db from '../providers/db';
import { Invite, Prisma, PrismaClient } from '@prisma/client';

class InviteRepository {
  model: Prisma.InviteDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.model = dbClient.invite;
  }

  getByGuid(guid: string): Promise<Invite> {
    return this.model.findFirst({
      where: {
        guid,
      },
    });
  }

  create(guid: string, listId: number) {
    return this.model.create({
      data: {
        guid,
        listId,
      },
    });
  }

  delete(guid: string) {
    return this.model.deleteMany({
      where: {
        guid,
      },
    });
  }
}

export default new InviteRepository(db.client);
