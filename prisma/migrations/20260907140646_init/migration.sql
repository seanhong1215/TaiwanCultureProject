-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "uuid" TEXT,
    "signInHistory" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "rewards" JSONB,
    "tickets" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "city" TEXT,
    "images" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "startDate" TEXT,
    "endDate" TEXT,
    "price" INTEGER,
    "eventType" TEXT,
    "status" TEXT,
    "eventAddress" TEXT,
    "content" JSONB NOT NULL,
    "activityDetails" JSONB,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journals" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT,
    "content" TEXT NOT NULL,
    "images" TEXT,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "avatar" TEXT,
    "name" TEXT,
    "rating" DOUBLE PRECISION,
    "activityTitle" TEXT,
    "imageFiles" JSONB,
    "reviewContent" TEXT,
    "activityId" INTEGER,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "isFavorited" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "lastName" TEXT,
    "firstName" TEXT,
    "nickName" TEXT,
    "gender" TEXT,
    "birthday" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "phoneNumber" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "activityId" INTEGER NOT NULL,
    "dates" JSONB NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "activityId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityName" TEXT,
    "last_bookable_date" TEXT,
    "activityLocation" TEXT,
    "activityPeriod" JSONB,
    "adultCount" INTEGER,
    "childCount" INTEGER,
    "adultPrice" INTEGER,
    "childPrice" INTEGER,
    "timeSlot" TEXT,
    "totalAmount" INTEGER,
    "paymentStatus" TEXT,
    "reservedStatus" TEXT,
    "actImage" TEXT,
    "paymentData" JSONB,
    "contactName" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_activityId_key" ON "favorites"("userId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_activityId_key" ON "reservations"("activityId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
