/*
  Warnings:

  - You are about to drop the `portofolio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `portofolio`;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `link` VARCHAR(255) NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `images` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
