-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InBodyScan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scanDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "weightKg" REAL NOT NULL,
    "bodyFatPercent" REAL NOT NULL,
    "bodyFatMassKg" REAL NOT NULL,
    "skeletalMuscleMassKg" REAL NOT NULL,
    "leanBodyMassKg" REAL NOT NULL,
    "bmi" REAL NOT NULL,
    "basalMetabolicRate" INTEGER,
    "visceralFatLevel" REAL,
    "totalBodyWaterL" REAL,
    "intracellularWaterL" REAL,
    "extracellularWaterL" REAL,
    "proteinKg" REAL,
    "mineralsKg" REAL,
    "rightArmLeanKg" REAL,
    "leftArmLeanKg" REAL,
    "trunkLeanKg" REAL,
    "rightLegLeanKg" REAL,
    "leftLegLeanKg" REAL,
    "rightArmFatKg" REAL,
    "leftArmFatKg" REAL,
    "trunkFatKg" REAL,
    "rightLegFatKg" REAL,
    "leftLegFatKg" REAL,
    "aiInsight" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InBodyScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planData" TEXT NOT NULL,
    "caloricTarget" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planData" TEXT NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "splitType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "InBodyScan_userId_scanDate_idx" ON "InBodyScan"("userId", "scanDate");

-- CreateIndex
CREATE INDEX "MealPlan_userId_idx" ON "MealPlan"("userId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");
