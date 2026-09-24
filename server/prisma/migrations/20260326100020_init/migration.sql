-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(128) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "fullname" VARCHAR(255) NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "profile_img" TEXT,
    "profile_img_id" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
