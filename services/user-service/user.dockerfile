FROM node:24-alpine

WORKDIR /app


COPY package*.json ./
COPY services/user-service/package*.json services/user-service/
COPY libs/jwt/package*.json libs/jwt/
RUN npm install --workspaces


COPY . .


RUN npm run build --workspace=@backendrestapi/jwt


WORKDIR /app/services/user-service
RUN npx prisma generate && npx tsc -p tsconfig.build.json

EXPOSE 3001
CMD ["node", "dist/main"]
