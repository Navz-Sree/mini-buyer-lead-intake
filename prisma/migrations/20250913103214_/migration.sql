/*
  Warnings:

  - The values [Chandigarh,Mohali,Zirakpur,Panchkula,Other] on the enum `City` will be removed. If these variants are still used in the database, this will fail.
  - The values [Apartment,Villa,Plot,Office,Retail] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.
  - The values [New,Qualified,Contacted,Visited,Negotiation,Converted,Dropped] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `diff` on the `buyer_history` table. All the data in the column will be lost.
  - You are about to drop the column `bhk` on the `buyers` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `buyers` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `buyers` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `buyers` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `buyers` table. All the data in the column will be lost.
  - Added the required column `action` to the `buyer_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leadSource` to the `buyers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `possessionTimeline` to the `buyers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'ADVERTISEMENT', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'TRADE_SHOW', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PossessionTimeline" AS ENUM ('IMMEDIATE', 'WITHIN_3_MONTHS', 'WITHIN_6_MONTHS', 'WITHIN_1_YEAR', 'AFTER_1_YEAR');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."City_new" AS ENUM ('MUMBAI', 'DELHI', 'BANGALORE', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'AHMEDABAD');
ALTER TABLE "public"."buyers" ALTER COLUMN "city" TYPE "public"."City_new" USING ("city"::text::"public"."City_new");
ALTER TYPE "public"."City" RENAME TO "City_old";
ALTER TYPE "public"."City_new" RENAME TO "City";
DROP TYPE "public"."City_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PropertyType_new" AS ENUM ('APARTMENT', 'INDEPENDENT_HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL');
ALTER TABLE "public"."buyers" ALTER COLUMN "propertyType" TYPE "public"."PropertyType_new" USING ("propertyType"::text::"public"."PropertyType_new");
ALTER TYPE "public"."PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "public"."PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "public"."PropertyType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Status_new" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED');
ALTER TABLE "public"."buyers" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."buyers" ALTER COLUMN "status" TYPE "public"."Status_new" USING ("status"::text::"public"."Status_new");
ALTER TYPE "public"."Status" RENAME TO "Status_old";
ALTER TYPE "public"."Status_new" RENAME TO "Status";
DROP TYPE "public"."Status_old";
ALTER TABLE "public"."buyers" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- DropIndex
DROP INDEX "public"."buyers_timeline_idx";

-- AlterTable
ALTER TABLE "public"."buyer_history" DROP COLUMN "diff",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "changes" TEXT;

-- AlterTable
ALTER TABLE "public"."buyers" DROP COLUMN "bhk",
DROP COLUMN "purpose",
DROP COLUMN "source",
DROP COLUMN "tags",
DROP COLUMN "timeline",
ADD COLUMN     "bhkRequirement" VARCHAR(50),
ADD COLUMN     "leadSource" "public"."LeadSource" NOT NULL,
ADD COLUMN     "possessionTimeline" "public"."PossessionTimeline" NOT NULL,
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "specificRequirements" TEXT,
ALTER COLUMN "fullName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "status" SET DEFAULT 'NEW',
ALTER COLUMN "notes" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "public"."BHK";

-- DropEnum
DROP TYPE "public"."Purpose";

-- DropEnum
DROP TYPE "public"."Source";

-- DropEnum
DROP TYPE "public"."Timeline";

-- CreateIndex
CREATE INDEX "buyers_priority_idx" ON "public"."buyers"("priority");

-- CreateIndex
CREATE INDEX "buyers_leadSource_idx" ON "public"."buyers"("leadSource");

-- CreateIndex
CREATE INDEX "buyers_possessionTimeline_idx" ON "public"."buyers"("possessionTimeline");
