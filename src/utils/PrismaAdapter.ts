import type { StorageAdapter } from 'grammy';
import { Prisma, PrismaClient } from '@prisma/client';

interface AdapterConstructor {
  client: PrismaClient;
}

export class PrismaAdapter<T> implements StorageAdapter<T> {
  sessionModel: Prisma.SessionDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;

  constructor(dbClient: PrismaClient) {
    this.sessionModel = dbClient.session;
  }

  private async findSession(key: string) {
    return this.sessionModel.findUnique({
      where: {
        key,
      },
    });
  }

  async read(key: string) {
    const session = await this.findSession(key);

    if (!session) {
      return undefined;
    }

    return JSON.parse(session.value as string) as T;
  }

  async write(key: string, value: T) {
    await this.sessionModel.update({
      where: { key },
      data: { value: JSON.stringify(value) },
    });
  }

  async delete(key: string) {
    await this.sessionModel.delete({ where: { key } });
  }
}
