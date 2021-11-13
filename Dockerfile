FROM node:14.17-alpine

WORKDIR /usr/samometer

# Зависимости обновятся только при изменении package.json. Если package.json
# не менялся, то обновления не будет
COPY package*.json ./

COPY prisma ./prisma

RUN npm ci

# Добавляем все файлы в контейнер
COPY . .

# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sh", "-c", "node -v; npm run db_push; npm run start_compose;"]
