FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
WORKDIR /app/services/user-service

RUN npm install && npm run build --workspace=@backendrestapi/jwt && npx prisma generate && npx tsc -p tsconfig.build.json

EXPOSE 3001
CMD ["node", "dist/main"]