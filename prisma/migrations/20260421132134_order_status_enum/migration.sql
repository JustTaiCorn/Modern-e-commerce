/*
  Warnings:

  - You are about to drop the column `isDelivered` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `orders` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- DropIndex
DROP INDEX "orders_isDelivered_idx";

-- DropIndex
DROP INDEX "orders_isPaid_idx";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "isDelivered",
DROP COLUMN "isPaid",
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMPTZ,
ADD COLUMN     "shippedAt" TIMESTAMPTZ,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");
