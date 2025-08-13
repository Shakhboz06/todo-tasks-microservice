FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY services/todo-service/package*.json services/todo-service/
COPY libs/jwt/package*.json libs/jwt/
RUN npm install --workspaces


COPY . .

RUN npm run build --workspace=@backendrestapi/jwt


WORKDIR /app/services/todo-service
RUN npx prisma generate && npx tsc -p tsconfig.build.json

EXPOSE 3002
CMD ["node", "dist/main"]
