import db from '../providers/db';
import { Session, Prisma, PrismaClient } from '@prisma/client';

class SessionRepository {
  model: Prisma.SessionDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.model = dbClient.session;
  }

  getByKeys(keys: string[]) {
    return this.model.findMany({
      where: { key: { in: keys } },
    });
  }
}

export default new SessionRepository(db.client);
