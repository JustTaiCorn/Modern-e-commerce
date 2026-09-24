-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "invoiceNumber" VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "orders_invoiceNumber_key" ON "orders"("invoiceNumber");

-- CreateIndex
CREATE INDEX "orders_invoiceNumber_idx" ON "orders"("invoiceNumber");
