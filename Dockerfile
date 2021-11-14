FROM node:14.17-alpine

WORKDIR /usr/samometer

COPY package*.json ./

COPY prisma ./prisma

RUN npm ci

COPY . .

CMD ["sh", "-c", "node -v; npm run db_push; npm run start;"]
