FROM node:12.16-alpine

WORKDIR /usr/samometer

# Зависимости обновятся только при изменении package.json. Если package.json
# не менялся, то обновления не будет
COPY package.json ./
RUN npm install

# Добавляем все файлы в контейнер
COPY . .

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sh", "-c", "node -v; npm -v; npm run start"]
