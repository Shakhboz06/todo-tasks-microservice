# FROM node:24-alpine

# WORKDIR /app
# COPY package*.json ./
# RUN npm install

# COPY . .
# WORKDIR /app/services/todo-service

# RUN npm install && npx prisma generate && npx tsc -p tsconfig.build.json

# EXPOSE 3001
# CMD ["node", "dist/main"]

FROM node:24-alpine

WORKDIR /app

# Install all workspace dependencies from repo root
COPY package*.json ./
COPY services/todo-service/package*.json services/todo-service/
COPY libs/jwt/package*.json libs/jwt/
RUN npm install --workspaces

# Copy rest of the source
COPY . .

# Build the shared JWT workspace first
RUN npm run build --workspace=@backendrestapi/jwt

# Move to todo-service and generate Prisma + build
WORKDIR /app/services/todo-service
RUN npx prisma generate && npx tsc -p tsconfig.build.json

EXPOSE 3002
CMD ["node", "dist/main"]
