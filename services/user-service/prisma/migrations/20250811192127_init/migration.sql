-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_pwd" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "public"."users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_email_key" ON "public"."users"("user_email");
