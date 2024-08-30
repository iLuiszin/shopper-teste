FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g typescript ts-node

RUN npm run build

RUN npm run swagger

RUN npx prisma migrate dev --name "init"

EXPOSE 80

CMD ["npm", "start"]
