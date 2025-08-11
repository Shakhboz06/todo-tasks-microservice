FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
WORKDIR /app/services/todo-service

RUN npm install && npx prisma generate && npx tsc -p tsconfig.build.json

EXPOSE 3001
CMD ["node", "dist/main"]