/*
  Warnings:

  - You are about to drop the column `countInStock` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - Made the column `variantId` on table `cart_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variantId` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sku` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `product_variants` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variantId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variantId_fkey";

-- AlterTable
ALTER TABLE "cart_items" ALTER COLUMN "variantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "variantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "price" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "countInStock",
DROP COLUMN "price";

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
