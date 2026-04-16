/*
  Warnings:

  - Added the required column `gender` to the `content_managers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "content_managers" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
