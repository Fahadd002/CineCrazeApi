// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

// src/app/shared/routes/index.ts
import { Router as Router11 } from "express";

// src/app/modules/auth/auth.route.ts
import { Router } from "express";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/modules/auth/auth.service.ts
import status3 from "http-status";

// src/generated/prisma/enums.ts
var Role = {
  ADMIN: "ADMIN",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  VIEWER: "VIEWER",
  SUPER_ADMIN: "SUPER_ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};
var Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER"
};
var PaymentStatus = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PENDING: "PENDING"
};
var AccessType = {
  FREE: "FREE",
  SUBSCRIPTION: "SUBSCRIPTION",
  TICKET: "TICKET",
  BOTH: "BOTH"
};
var ReviewStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};
var MediaType = {
  MOVIE: "MOVIE",
  TV_SERIES: "TV_SERIES"
};

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.1",
  "engineVersion": "55ae170b1ced7fc6ed07a15f110549408c501bb3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model Admin {\n  id            String    @id @default(uuid(7))\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel User {\n  id                 String     @id @default(cuid())\n  name               String\n  email              String     @unique\n  emailVerified      Boolean    @default(false)\n  role               Role       @default(VIEWER)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n\n  subscriptionPlan SubscriptionPlan @default(FREE)\n  subscriptionEnds DateTime?\n\n  sessions Session[]\n  accounts Account[]\n\n  viewer         Viewer?\n  contentManager ContentManager?\n  admin          Admin?\n\n  @@index([email])\n  @@index([role])\n  @@index([status])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Content {\n  id           String    @id @default(uuid())\n  title        String\n  description  String?   @db.Text\n  posterUrl    String?\n  trailerUrl   String?\n  streamingUrl String?\n  releaseYear  Int\n  director     String?\n  cast         String[]\n  genres       String[]\n  mediaType    MediaType @default(MOVIE)\n\n  accessType  AccessType @default(FREE)\n  ticketPrice Float?\n\n  views     Int      @default(0)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  managerId String?\n  manager   ContentManager? @relation(fields: [managerId], references: [id])\n\n  reviews   Review[]\n  watchlist Watchlist[]\n  tickets   Ticket[]\n\n  @@index([title])\n  @@index([releaseYear])\n  @@index([genres])\n  @@index([accessType])\n  @@map("contents")\n}\n\nmodel ContentManager {\n  id            String    @id @default(uuid(7))\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  gender        Gender\n  isDeleted     Boolean   @default(false)\n  deletedAt     DateTime?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n\n  // content control\n  contents Content[]\n\n  // relation\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@map("content_managers")\n}\n\nenum Role {\n  ADMIN\n  CONTENT_MANAGER\n  VIEWER\n  SUPER_ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum PaymentStatus {\n  PAID\n  UNPAID\n  FAILED\n  REFUNDED\n  PENDING\n}\n\nenum AccessType {\n  FREE\n  SUBSCRIPTION\n  TICKET\n  BOTH\n}\n\nenum SubscriptionPlan {\n  FREE\n  PREMIUM_MONTHLY\n  PREMIUM_YEARLY\n}\n\nenum ReviewStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum MediaType {\n  MOVIE\n  TV_SERIES\n}\n\nenum PaymentPurpose {\n  TICKET_PURCHASE\n  SUBSCRIPTION_PURCHASE\n  SUBSCRIPTION_RENEWAL\n  REFUND\n}\n\nmodel Like {\n  id        String   @id @default(uuid())\n  createdAt DateTime @default(now())\n\n  viewerId String\n  viewer   Viewer @relation(fields: [viewerId], references: [id], onDelete: Cascade)\n\n  reviewId String\n  review   Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)\n\n  @@unique([viewerId, reviewId])\n  @@map("likes")\n}\n\nmodel Payment {\n  id                 String        @id @default(uuid(7))\n  amount             Float\n  transactionId      String        @unique @db.Uuid()\n  stripeEventId      String?       @unique\n  status             PaymentStatus @default(UNPAID)\n  paymentGatewayData Json?\n  createdAt          DateTime      @default(now())\n  updatedAt          DateTime      @updatedAt\n  purpose            String? // TICKET_PURCHASE, SUBSCRIPTION_PURCHASE, SUBSCRIPTION_RENEWAL\n\n  viewerId String\n  viewer   Viewer @relation(fields: [viewerId], references: [id], onDelete: Cascade)\n\n  ticketId       String?       @unique\n  ticket         Ticket?       @relation(fields: [ticketId], references: [id], onDelete: Cascade)\n  // One-to-many relationship with Subscription\n  subscriptionId String?\n  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])\n\n  @@index([viewerId])\n  @@index([transactionId])\n  @@index([status])\n  @@map("payments")\n}\n\nmodel Review {\n  id         String       @id @default(uuid())\n  rating     Int\n  tags       String[]\n  hasSpoiler Boolean      @default(false)\n  status     ReviewStatus @default(APPROVED)\n  likesCount Int          @default(0)\n  createdAt  DateTime     @default(now())\n  updatedAt  DateTime     @updatedAt\n\n  viewerId String\n  viewer   Viewer @relation(fields: [viewerId], references: [id], onDelete: Cascade)\n\n  contentId String\n  content   Content @relation(fields: [contentId], references: [id], onDelete: Cascade)\n\n  parentId String?\n  parent   Review?  @relation("ReviewReplies", fields: [parentId], references: [id])\n  replies  Review[] @relation("ReviewReplies")\n\n  likes Like[]\n\n  @@index([viewerId])\n  @@index([contentId])\n  @@index([status])\n  @@map("reviews")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Subscription {\n  id        String           @id @default(uuid())\n  plan      SubscriptionPlan\n  amount    Float\n  startDate DateTime         @default(now())\n  endDate   DateTime\n  status    PaymentStatus    @default(PENDING)\n  autoRenew Boolean          @default(false)\n\n  viewerId String\n  viewer   Viewer @relation(fields: [viewerId], references: [id], onDelete: Cascade)\n\n  // Subscription can have multiple payments (for renewals)\n  payments Payment[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([viewerId])\n  @@index([status])\n  @@index([endDate])\n  @@map("subscriptions")\n}\n\nmodel Ticket {\n  id            String        @id @default(uuid())\n  viewerId      String\n  viewer        Viewer        @relation(fields: [viewerId], references: [id], onDelete: Cascade)\n  paymentStatus PaymentStatus @default(UNPAID)\n  contentId     String\n  content       Content       @relation(fields: [contentId], references: [id], onDelete: Cascade)\n  payment       Payment?\n  purchasedAt   DateTime      @default(now())\n\n  @@unique([viewerId, contentId])\n  @@index([viewerId])\n  @@index([contentId])\n  @@map("tickets")\n}\n\nmodel Viewer {\n  id             String   @id @default(uuid())\n  name           String\n  email          String   @unique\n  profilePhoto   String?\n  contactNumber  String?\n  bio            String?  @db.Text\n  favoriteGenres String[]\n\n  // Subscription fields\n  subscriptionPlan SubscriptionPlan @default(FREE)\n  subscriptionEnds DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  watchlist     Watchlist[]\n  reviews       Review[]\n  likes         Like[]\n  tickets       Ticket[]\n  subscriptions Subscription[]\n  payments      Payment[]\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([subscriptionPlan])\n  @@map("viewers")\n}\n\nmodel Watchlist {\n  id String @id @default(uuid(7))\n\n  viewerId String\n  viewer   Viewer @relation(fields: [viewerId], references: [id], onDelete: Cascade)\n\n  contentId String\n  content   Content @relation(fields: [contentId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@unique([viewerId, contentId])\n  @@index([viewerId])\n  @@index([contentId])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subscriptionPlan","kind":"enum","type":"SubscriptionPlan"},{"name":"subscriptionEnds","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"UserToViewer"},{"name":"contentManager","kind":"object","type":"ContentManager","relationName":"ContentManagerToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Content":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"posterUrl","kind":"scalar","type":"String"},{"name":"trailerUrl","kind":"scalar","type":"String"},{"name":"streamingUrl","kind":"scalar","type":"String"},{"name":"releaseYear","kind":"scalar","type":"Int"},{"name":"director","kind":"scalar","type":"String"},{"name":"cast","kind":"scalar","type":"String"},{"name":"genres","kind":"scalar","type":"String"},{"name":"mediaType","kind":"enum","type":"MediaType"},{"name":"accessType","kind":"enum","type":"AccessType"},{"name":"ticketPrice","kind":"scalar","type":"Float"},{"name":"views","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"managerId","kind":"scalar","type":"String"},{"name":"manager","kind":"object","type":"ContentManager","relationName":"ContentToContentManager"},{"name":"reviews","kind":"object","type":"Review","relationName":"ContentToReview"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"ContentToWatchlist"},{"name":"tickets","kind":"object","type":"Ticket","relationName":"ContentToTicket"}],"dbName":"contents"},"ContentManager":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"contents","kind":"object","type":"Content","relationName":"ContentToContentManager"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ContentManagerToUser"}],"dbName":"content_managers"},"Like":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"viewerId","kind":"scalar","type":"String"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"LikeToViewer"},{"name":"reviewId","kind":"scalar","type":"String"},{"name":"review","kind":"object","type":"Review","relationName":"LikeToReview"}],"dbName":"likes"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"purpose","kind":"scalar","type":"String"},{"name":"viewerId","kind":"scalar","type":"String"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"PaymentToViewer"},{"name":"ticketId","kind":"scalar","type":"String"},{"name":"ticket","kind":"object","type":"Ticket","relationName":"PaymentToTicket"},{"name":"subscriptionId","kind":"scalar","type":"String"},{"name":"subscription","kind":"object","type":"Subscription","relationName":"PaymentToSubscription"}],"dbName":"payments"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"tags","kind":"scalar","type":"String"},{"name":"hasSpoiler","kind":"scalar","type":"Boolean"},{"name":"status","kind":"enum","type":"ReviewStatus"},{"name":"likesCount","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"viewerId","kind":"scalar","type":"String"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"ReviewToViewer"},{"name":"contentId","kind":"scalar","type":"String"},{"name":"content","kind":"object","type":"Content","relationName":"ContentToReview"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Review","relationName":"ReviewReplies"},{"name":"replies","kind":"object","type":"Review","relationName":"ReviewReplies"},{"name":"likes","kind":"object","type":"Like","relationName":"LikeToReview"}],"dbName":"reviews"},"Subscription":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"plan","kind":"enum","type":"SubscriptionPlan"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"autoRenew","kind":"scalar","type":"Boolean"},{"name":"viewerId","kind":"scalar","type":"String"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"SubscriptionToViewer"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToSubscription"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"subscriptions"},"Ticket":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"viewerId","kind":"scalar","type":"String"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"TicketToViewer"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"contentId","kind":"scalar","type":"String"},{"name":"content","kind":"object","type":"Content","relationName":"ContentToTicket"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToTicket"},{"name":"purchasedAt","kind":"scalar","type":"DateTime"}],"dbName":"tickets"},"Viewer":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"favoriteGenres","kind":"scalar","type":"String"},{"name":"subscriptionPlan","kind":"enum","type":"SubscriptionPlan"},{"name":"subscriptionEnds","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"watchlist","kind":"object","type":"Watchlist","relationName":"ViewerToWatchlist"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToViewer"},{"name":"likes","kind":"object","type":"Like","relationName":"LikeToViewer"},{"name":"tickets","kind":"object","type":"Ticket","relationName":"TicketToViewer"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"SubscriptionToViewer"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToViewer"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToViewer"}],"dbName":"viewers"},"Watchlist":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"viewerId","kind":"scalar","type":"String"},{"name":"viewer","kind":"object","type":"Viewer","relationName":"ViewerToWatchlist"},{"name":"contentId","kind":"scalar","type":"String"},{"name":"content","kind":"object","type":"Content","relationName":"ContentToWatchlist"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","viewer","contents","_count","manager","content","parent","replies","review","likes","reviews","watchlist","ticket","payments","subscription","payment","tickets","subscriptions","contentManager","admin","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","data","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","create","update","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","having","_min","_max","Admin.groupBy","Admin.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Content.findUnique","Content.findUniqueOrThrow","Content.findFirst","Content.findFirstOrThrow","Content.findMany","Content.createOne","Content.createMany","Content.createManyAndReturn","Content.updateOne","Content.updateMany","Content.updateManyAndReturn","Content.upsertOne","Content.deleteOne","Content.deleteMany","_avg","_sum","Content.groupBy","Content.aggregate","ContentManager.findUnique","ContentManager.findUniqueOrThrow","ContentManager.findFirst","ContentManager.findFirstOrThrow","ContentManager.findMany","ContentManager.createOne","ContentManager.createMany","ContentManager.createManyAndReturn","ContentManager.updateOne","ContentManager.updateMany","ContentManager.updateManyAndReturn","ContentManager.upsertOne","ContentManager.deleteOne","ContentManager.deleteMany","ContentManager.groupBy","ContentManager.aggregate","Like.findUnique","Like.findUniqueOrThrow","Like.findFirst","Like.findFirstOrThrow","Like.findMany","Like.createOne","Like.createMany","Like.createManyAndReturn","Like.updateOne","Like.updateMany","Like.updateManyAndReturn","Like.upsertOne","Like.deleteOne","Like.deleteMany","Like.groupBy","Like.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Subscription.findUnique","Subscription.findUniqueOrThrow","Subscription.findFirst","Subscription.findFirstOrThrow","Subscription.findMany","Subscription.createOne","Subscription.createMany","Subscription.createManyAndReturn","Subscription.updateOne","Subscription.updateMany","Subscription.updateManyAndReturn","Subscription.upsertOne","Subscription.deleteOne","Subscription.deleteMany","Subscription.groupBy","Subscription.aggregate","Ticket.findUnique","Ticket.findUniqueOrThrow","Ticket.findFirst","Ticket.findFirstOrThrow","Ticket.findMany","Ticket.createOne","Ticket.createMany","Ticket.createManyAndReturn","Ticket.updateOne","Ticket.updateMany","Ticket.updateManyAndReturn","Ticket.upsertOne","Ticket.deleteOne","Ticket.deleteMany","Ticket.groupBy","Ticket.aggregate","Viewer.findUnique","Viewer.findUniqueOrThrow","Viewer.findFirst","Viewer.findFirstOrThrow","Viewer.findMany","Viewer.createOne","Viewer.createMany","Viewer.createManyAndReturn","Viewer.updateOne","Viewer.updateMany","Viewer.updateManyAndReturn","Viewer.upsertOne","Viewer.deleteOne","Viewer.deleteMany","Viewer.groupBy","Viewer.aggregate","Watchlist.findUnique","Watchlist.findUniqueOrThrow","Watchlist.findFirst","Watchlist.findFirstOrThrow","Watchlist.findMany","Watchlist.createOne","Watchlist.createMany","Watchlist.createManyAndReturn","Watchlist.updateOne","Watchlist.updateMany","Watchlist.updateManyAndReturn","Watchlist.upsertOne","Watchlist.deleteOne","Watchlist.deleteMany","Watchlist.groupBy","Watchlist.aggregate","AND","OR","NOT","id","viewerId","contentId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","name","email","profilePhoto","contactNumber","bio","favoriteGenres","SubscriptionPlan","subscriptionPlan","subscriptionEnds","updatedAt","userId","has","hasEvery","hasSome","every","some","none","PaymentStatus","paymentStatus","purchasedAt","plan","amount","startDate","endDate","status","autoRenew","rating","tags","hasSpoiler","ReviewStatus","likesCount","parentId","transactionId","stripeEventId","paymentGatewayData","purpose","ticketId","subscriptionId","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","reviewId","Gender","gender","isDeleted","deletedAt","title","description","posterUrl","trailerUrl","streamingUrl","releaseYear","director","cast","genres","MediaType","mediaType","AccessType","accessType","ticketPrice","views","managerId","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","emailVerified","Role","role","UserStatus","needPasswordChange","image","viewerId_contentId","viewerId_reviewId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "1Qd_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_gMAIdMCAQCjAwAhAwAAABMAIAEAABQAMAIAABUAIAEAAAATACATBgAA7wMAIAoAAPgDACALAACABAAgDAAAqAMAIA4AAKkDACCBAgAA_QMAMIICAAAYABCDAgAA_QMAMIQCAQCiAwAhhQIBAKIDACGGAgEAogMAIYcCQACmAwAhnAJAAKYDACGrAgAA_wOxAiKtAgIA_gMAIa4CAACXAwAgrwIgAMsDACGxAgIA_gMAIbICAQCjAwAhBgYAANsGACAKAADlBgAgCwAA5wYAIAwAALMFACAOAAC0BQAgsgIAAJIEACATBgAA7wMAIAoAAPgDACALAACABAAgDAAAqAMAIA4AAKkDACCBAgAA_QMAMIICAAAYABCDAgAA_QMAMIQCAQAAAAGFAgEAogMAIYYCAQCiAwAhhwJAAKYDACGcAkAApgMAIasCAAD_A7ECIq0CAgD-AwAhrgIAAJcDACCvAiAAywMAIbECAgD-AwAhsgIBAKMDACEDAAAAGAAgAQAAGQAwAgAAGgAgAQAAABgAIAMAAAAYACABAAAZADACAAAaACAJBgAA7wMAIA0AAPwDACCBAgAA-wMAMIICAAAeABCDAgAA-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_AgEAAAABAR4AAPABACAEhAIBAAAAAYUCAQAAAAGHAkAAAAABvwIBAAAAAQEeAADyAQAwAR4AAPIBADAGBgAAigUAIA0AAO0EACCEAgEAjAQAIYUCAQCMBAAhhwJAAI0EACG_AgEAjAQAIQIAAAAgACAeAAD1AQAgBIQCAQCMBAAhhQIBAIwEACGHAkAAjQQAIb8CAQCMBAAhAgAAAB4AIB4AAPcBACACAAAAHgAgHgAA9wEAIAMAAAAgACAlAADwAQAgJgAA9QEAIAEAAAAgACABAAAAHgAgAwgAAM8FACArAADRBQAgLAAA0AUAIAeBAgAAxAMAMIICAAD-AQAQgwIAAMQDADCEAgEAjgMAIYUCAQCOAwAhhwJAAI8DACG_AgEAjgMAIQMAAAAeACABAAD9AQAwKgAA_gEAIAMAAAAeACABAAAfADACAAAgACABAAAALwAgAQAAAC8AIAMAAAApACABAAAuADACAAAvACADAAAAKQAgAQAALgAwAgAALwAgAwAAACkAIAEAAC4AMAIAAC8AIA8GAADKBAAgEQAAsQQAIBMAALIEACCEAgEAAAABhQIBAAAAAYcCQAAAAAGcAkAAAAABqAIIAAAAAasCAAAApQICswIBAAAAAbQCAQAAAAG1AoAAAAABtgIBAAAAAbcCAQAAAAG4AgEAAAABAR4AAIYCACAMhAIBAAAAAYUCAQAAAAGHAkAAAAABnAJAAAAAAagCCAAAAAGrAgAAAKUCArMCAQAAAAG0AgEAAAABtQKAAAAAAbYCAQAAAAG3AgEAAAABuAIBAAAAAQEeAACIAgAwAR4AAIgCADABAAAAJQAgAQAAACwAIA8GAADIBAAgEQAArgQAIBMAAK8EACCEAgEAjAQAIYUCAQCMBAAhhwJAAI0EACGcAkAAjQQAIagCCACrBAAhqwIAAKwEpQIiswIBAIwEACG0AgEAlgQAIbUCgAAAAAG2AgEAlgQAIbcCAQCWBAAhuAIBAJYEACECAAAALwAgHgAAjQIAIAyEAgEAjAQAIYUCAQCMBAAhhwJAAI0EACGcAkAAjQQAIagCCACrBAAhqwIAAKwEpQIiswIBAIwEACG0AgEAlgQAIbUCgAAAAAG2AgEAlgQAIbcCAQCWBAAhuAIBAJYEACECAAAAKQAgHgAAjwIAIAIAAAApACAeAACPAgAgAQAAACUAIAEAAAAsACADAAAALwAgJQAAhgIAICYAAI0CACABAAAALwAgAQAAACkAIAoIAADKBQAgKwAAzQUAICwAAMwFACB9AADLBQAgfgAAzgUAILQCAACSBAAgtQIAAJIEACC2AgAAkgQAILcCAACSBAAguAIAAJIEACAPgQIAAL8DADCCAgAAmAIAEIMCAAC_AwAwhAIBAI4DACGFAgEAjgMAIYcCQACPAwAhnAJAAI8DACGoAggAswMAIasCAACvA6UCIrMCAQDAAwAhtAIBAJYDACG1AgAAwQMAILYCAQCWAwAhtwIBAJYDACG4AgEAlgMAIQMAAAApACABAACXAgAwKgAAmAIAIAMAAAApACABAAAuADACAAAvACABAAAAGgAgAQAAABoAIAMAAAAYACABAAAZADACAAAaACADAAAAGAAgAQAAGQAwAgAAGgAgAwAAABgAIAEAABkAMAIAABoAIBAGAACYBQAgCgAAmQUAIAsAAJ0FACAMAACaBQAgDgAAmwUAIIQCAQAAAAGFAgEAAAABhgIBAAAAAYcCQAAAAAGcAkAAAAABqwIAAACxAgKtAgIAAAABrgIAAJcFACCvAiAAAAABsQICAAAAAbICAQAAAAEBHgAAoAIAIAuEAgEAAAABhQIBAAAAAYYCAQAAAAGHAkAAAAABnAJAAAAAAasCAAAAsQICrQICAAAAAa4CAACXBQAgrwIgAAAAAbECAgAAAAGyAgEAAAABAR4AAKICADABHgAAogIAMAEAAAAYACAQBgAAlQUAIAoAAP4EACALAAD_BAAgDAAAgAUAIA4AAIEFACCEAgEAjAQAIYUCAQCMBAAhhgIBAIwEACGHAkAAjQQAIZwCQACNBAAhqwIAAPwEsQIirQICAPoEACGuAgAA-wQAIK8CIAC9BAAhsQICAPoEACGyAgEAlgQAIQIAAAAaACAeAACmAgAgC4QCAQCMBAAhhQIBAIwEACGGAgEAjAQAIYcCQACNBAAhnAJAAI0EACGrAgAA_ASxAiKtAgIA-gQAIa4CAAD7BAAgrwIgAL0EACGxAgIA-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_gIAMAEeAAD-AgAwBgYAAI4EACAKAACPBAAghAIBAIwEACGFAgEAjAQAIYYCAQCMBAAhhwJAAI0EACECAAAADwAgHgAAgQMAIASEAgEAjAQAIYUCAQCMBAAhhgIBAIwEACGHAkAAjQQAIQIAAAANACAeAACDAwAgAgAAAA0AIB4AAIMDACADAAAADwAgJQAA_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ApQIIigIAAAClAgiPAgAAsAOlAiIEiAIAAAClAgKJAgAAAKUCCIoCAAAApQIIjwIAALEDpQIiDYECAACyAwAwggIAAMYCABCDAgAAsgMAMIQCAQCOAwAhhQIBAI4DACGHAkAAjwMAIZwCQACPAwAhpwIAAJgDmgIiqAIIALMDACGpAkAAjwMAIaoCQACPAwAhqwIAAK8DpQIirAIgALQDACENCAAAkQMAICsAALgDACAsAAC4AwAgfQAAuAMAIH4AALgDACCIAggAAAABiQIIAAAABIoCCAAAAASLAggAAAABjAIIAAAAAY0CCAAAAAGOAggAAAABjwIIALcDACEFCAAAkQMAICsAALYDACAsAAC2AwAgiAIgAAAAAY8CIAC1AwAhBQgAAJEDACArAAC2AwAgLAAAtgMAIIgCIAAAAAGPAiAAtQMAIQKIAiAAAAABjwIgALYDACENCAAAkQMAICsAALgDACAsAAC4AwAgfQAAuAMAIH4AALgDACCIAggAAAABiQIIAAAABIoCCAAAAASLAggAAAABjAIIAAAAAY0CCAAAAAGOAggAAAABjwIIALcDACEIiAIIAAAAAYkCCAAAAASKAggAAAAEiwIIAAAAAYwCCAAAAAGNAggAAAABjgIIAAAAAY8CCAC4AwAhDoECAAC5AwAwggIAALACABCDAgAAuQMAMIQCAQCOAwAhhQIBAI4DACGGAgEAjgMAIYcCQACPAwAhnAJAAI8DACGrAgAAuwOxAiKtAgIAugMAIa4CAACXAwAgrwIgALQDACGxAgIAugMAIbICAQCWAwAhDQgAAJEDACArAACRAwAgLAAAkQMAIH0AALgDACB-AACRAwAgiAICAAAAAYkCAgAAAASKAgIAAAAEiwICAAAAAYwCAgAAAAGNAgIAAAABjgICAAAAAY8CAgC-AwAhBwgAAJEDACArAAC9AwAgLAAAvQMAIIgCAAAAsQICiQIAAACxAgiKAgAAALECCI8CAAC8A7ECIgcIAACRAwAgKwAAvQMAICwAAL0DACCIAgAAALECAokCAAAAsQIIigIAAACxAgiPAgAAvAOxAiIEiAIAAACxAgKJAgAAALECCIoCAAAAsQIIjwIAAL0DsQIiDQgAAJEDACArAACRAwAgLAAAkQMAIH0AALgDACB-AACRAwAgiAICAAAAAYkCAgAAAASKAgIAAAAEiwICAAAAAYwCAgAAAAGNAgIAAAABjgICAAAAAY8CAgC-AwAhD4ECAAC_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_gMAIdMCAQCjAwAh6wIAABMAIOwCAAATACAUBgAA7wMAIBEAAPIDACATAADzAwAggQIAAPADADCCAgAAKQAQgwIAAPADADCEAgEAogMAIYUCAQCiAwAhhwJAAKYDACGcAkAApgMAIagCCADtAwAhqwIAAO4DpQIiswIBAPQDACG0AgEAowMAIbUCAADxAwAgtgIBAKMDACG3AgEAowMAIbgCAQCjAwAh6wIAACkAIOwCAAApACAChQIBAAAAAb8CAQAAAAEJBgAA7wMAIA0AAPwDACCBAgAA-wMAMIICAAAeABCDAgAA-wMAMIQCAQCiAwAhhQIBAKIDACGHAkAApgMAIb8CAQCiAwAhFQYAAO8DACAKAAD4AwAgCwAAgAQAIAwAAKgDACAOAACpAwAggQIAAP0DADCCAgAAGAAQgwIAAP0DADCEAgEAogMAIYUCAQCiAwAhhgIBAKIDACGHAkAApgMAIZwCQACmAwAhqwIAAP8DsQIirQICAP4DACGuAgAAlwMAIK8CIADLAwAhsQICAP4DACGyAgEAowMAIesCAAAYACDsAgAAGAAgEwYAAO8DACAKAAD4AwAgCwAAgAQAIAwAAKgDACAOAACpAwAggQIAAP0DADCCAgAAGAAQgwIAAP0DADCEAgEAogMAIYUCAQCiAwAhhgIBAKIDACGHAkAApgMAIZwCQACmAwAhqwIAAP8DsQIirQICAP4DACGuAgAAlwMAIK8CIADLAwAhsQICAP4DACGyAgEAowMAIQiIAgIAAAABiQICAAAABIoCAgAAAASLAgIAAAABjAICAAAAAY0CAgAAAAGOAgIAAAABjwICAJEDACEEiAIAAACxAgKJAgAAALECCIoCAAAAsQIIjwIAAL0DsQIiFQYAAO8DACAKAAD4AwAgCwAAgAQAIAwAAKgDACAOAACpAwAggQIAAP0DADCCAgAAGAAQgwIAAP0DADCEAgEAogMAIYUCAQCiAwAhhgIBAKIDACGHAkAApgMAIZwCQACmAwAhqwIAAP8DsQIirQICAP4DACGuAgAAlwMAIK8CIADLAwAhsQICAP4DACGyAgEAowMAIesCAAAYACDsAgAAGAAgGAkAAOgDACAPAACoAwAgEAAApwMAIBUAAKoDACCBAgAAgQQAMIICAAATABCDAgAAgQQAMIQCAQCiAwAhhwJAAKYDACGcAkAApgMAIcQCAQCiAwAhxQIBAKMDACHGAgEAowMAIccCAQCjAwAhyAIBAKMDACHJAgIA_gMAIcoCAQCjAwAhywIAAJcDACDMAgAAlwMAIM4CAACCBM4CItACAACDBNACItECCACEBAAh0gICAP4DACHTAgEAowMAIQSIAgAAAM4CAokCAAAAzgIIigIAAADOAgiPAgAA1gPOAiIEiAIAAADQAgKJAgAAANACCIoCAAAA0AIIjwIAANQD0AIiCIgCCAAAAAGJAggAAAAFigIIAAAABYsCCAAAAAGMAggAAAABjQIIAAAAAY4CCAAAAAGPAggA0gMAIQKFAgEAAAABhgIBAAAAAQkGAADvAwAgCgAA-AMAIIECAACGBAAwggIAAA0AEIMCAACGBAAwhAIBAKIDACGFAgEAogMAIYYCAQCiAwAhhwJAAKYDACERAwAArQMAIIECAACHBAAwggIAAAcAEIMCAACHBAAwhAIBAKIDACGHAkAApgMAIZwCQACmAwAhnQIBAKIDACHXAgEAogMAIdgCAQCiAwAh2QIBAKMDACHaAgEAowMAIdsCAQCjAwAh3AJAAKUDACHdAkAApQMAId4CAQCjAwAh3wIBAKMDACEMAwAArQMAIIECAACIBAAwggIAAAMAEIMCAACIBAAwhAIBAKIDACGHAkAApgMAIZwCQACmAwAhnQIBAKIDACHWAkAApgMAIeACAQCiAwAh4QIBAKMDACHiAgEAowMAIQAAAAHwAgEAAAABAfACQAAAAAEFJQAAzgcAICYAANQHACDtAgAAzwcAIO4CAADTBwAg8wIAAN8CACAFJQAAzAcAICYAANEHACDtAgAAzQcAIO4CAADQBwAg8wIAABUAIAMlAADOBwAg7QIAAM8HACDzAgAA3wIAIAMlAADMBwAg7QIAAM0HACDzAgAAFQAgAAAAAAHwAgEAAAABAvACAQAAAAT6AgEAAAAFAfACAAAAmgICAfACQAAAAAELJQAAngUAMCYAAKMFADDtAgAAnwUAMO4CAACgBQAw7wIAAKEFACDwAgAAogUAMPECAACiBQAw8gIAAKIFADDzAgAAogUAMPQCAACkBQAw9QIAAKUFADALJQAA8AQAMCYAAPUEADDtAgAA8QQAMO4CAADyBAAw7wIAAPMEACDwAgAA9AQAMPECAAD0BAAw8gIAAPQEADDzAgAA9AQAMPQCAAD2BAAw9QIAAPcEADALJQAA4gQAMCYAAOcEADDtAgAA4wQAMO4CAADkBAAw7wIAAOUEACDwAgAA5gQAMPECAADmBAAw8gIAAOYEADDzAgAA5gQAMPQCAADoBAAw9QIAAOkEADALJQAAzQQAMCYAANIEADDtAgAAzgQAMO4CAADPBAAw7wIAANAEACDwAgAA0QQAMPECAADRBAAw8gIAANEEADDzAgAA0QQAMPQCAADTBAAw9QIAANQEADALJQAAswQAMCYAALgEADDtAgAAtAQAMO4CAAC1BAAw7wIAALYEACDwAgAAtwQAMPECAAC3BAAw8gIAALcEADDzAgAAtwQAMPQCAAC5B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-wMAMIICAAAeABCDAgAA-wMAMIQCAQAAAAGFAgEAogMAIYcCQACmAwAhvwIBAKIDACHqAgAA-gMAIAIAAAAgACAeAADsBAAgAgAAAOoEACAeAADrBAAgB4ECAADpBAAwggIAAOoEABCDAgAA6QQAMIQCAQCiAwAhhQIBAKIDACGHAkAApgMAIb8CAQCiAwAhB4ECAADpBAAwggIAAOoEABCDAgAA6QQAMIQCAQCiAwAhhQIBAKIDACGHAkAApgMAIb8CAQCiAwAhA4QCAQCMBAAhhwJAAI0EACG_AgEAjAQAIQQNAADtBAAghAIBAIwEACGHAkAAjQQAIb8CAQCMBAAhBSUAAKsHACAmAACuBwAg7QIAAKwHACDuAgAArQcAIPMCAAAaACAEDQAA7wQAIIQCAQAAAAGHAkAAAAABvwIBAAAAAQMlAACrBwAg7QIAAKwHACDzAgAAGgAgDgoAAJkFACALAACdBQAgDAAAmgUAIA4AAJsFACCEAgEAAAABhgIBAAAAAYcCQAAAAAGcAkAAAAABqwIAAACxAgKtAgIAAAABrgIAAJcFACCvAiAAAAABsQICAAAAAbICAQAAAAECAAAAGgAgJQAAnAUAIAMAAAAaACAlAACcBQAgJgAA_QQAIAEeAACqBwAwEwYAAO8DACAKAAD4AwAgCwAAgAQAIAwAAKgDACAOAACpAwAggQIAAP0DADCCAgAAGAAQgwIAAP0DADCEAgEAAAABhQIBAKIDACGGAgEAogMAIYcCQACmAwAhnAJAAKYDACGrAgAA_wOxAiKtAgIA_gMAIa4CAACXAwAgrwIgAMsDACGxAgIA_gMAIbICAQCjAwAhAgAAABoAIB4AAP0EACACAAAA-AQAIB4AAPkEACAOgQIAAPcEADCCAgAA-AQAEIMCAAD3BAAwhAIBAKIDACGFAgEAogMAIYYCAQCiAwAhhwJAAKYDACGcAkAApgMAIasCAAD_A7ECIq0CAgD-AwAhrgIAAJcDACCvAiAAywMAIbECAgD-AwAhsgIBAKMDACEOgQIAAPcEADCCAgAA-AQAEIMCAAD3BAAwhAIBAKIDACGFAgEAogMAIYYCAQCiAwAhhwJAAKYDACGcAkAApgMAIasCAAD_A7ECIq0CAgD-AwAhrgIAAJcDACCvAiAAywMAIbECAgD-AwAhsgIBAKMDACEKhAIBAIwEACGGAgEAjAQAIYcCQACNBAAhnAJAAI0EACGrAgAA_ASxAiKtAgIA-gQAIa4CAAD7BAAgrwIgAL0EACGxAgIA-gQAIbICAQCWBAAhBfACAgAAAAH2AgIAAAAB9wICAAAAAfgCAgAAAAH5AgIAAAABAvACAQAAAAT6AgEAAAAFAfACAAAAsQICDgoAAP4EACALAAD_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_gYAICYAAIUHACDtAgAA_wYAIO4CAACEBwAg8wIAAF0AIBMPAACJBgAgEAAAigYAIBUAAIsGACCEAgEAAAABhwJAAAAAAZwCQAAAAAHEAgEAAAABxQIBAAAAAcYCAQAAAAHHAgEAAAAByAIBAAAAAckCAgAAAAHKAgEAAAABywIAAIcGACDMAgAAiAYAIM4CAAAAzgIC0AIAAADQAgLRAggAAAAB0gICAAAAAQIAAAAVACAlAACGBgAgAwAAABUAICUAAIYGACAmAADnBQAgAR4AAIMHADAYCQAA6AMAIA8AAKgDACAQAACnAwAgFQAAqgMAIIECAACBBAAwggIAABMAEIMCAACBBAAwhAIBAAAAAYcCQACmAwAhnAJAAKYDACHEAgEAogMAIcUCAQCjAwAhxgIBAKMDACHHAgEAowMAIcgCAQCjAwAhyQICAP4DACHKAgEAowMAIcsCAACXAwAgzAIAAJcDACDOAgAAggTOAiLQAgAAgwTQAiLRAggAhAQAIdICAgD-AwAh0wIBAKMDACECAAAAFQAgHgAA5wUAIAIAAADgBQAgHgAA4QUAIBSBAgAA3wUAMIICAADgBQAQgwIAAN8FADCEAgEAogMAIYcCQACmAwAhnAJAAKYDACHEAgEAogMAIcUCAQCjAwAhxgIBAKMDACHHAgEAowMAIcgCAQCjAwAhyQICAP4DACHKAgEAowMAIcsCAACXAwAgzAIAAJcDACDOAgAAggTOAiLQAgAAgwTQAiLRAggAhAQAIdICAgD-AwAh0wIBAKMDACEUgQIAAN8FADCCAgAA4AUAEIMCAADfBQAwhAIBAKIDACGHAkAApgMAIZwCQACmAwAhxAIBAKIDACHFAgEAowMAIcYCAQCjAwAhxwIBAKMDACHIAgEAowMAIckCAgD-AwAhygIBAKMDACHLAgAAlwMAIMwCAACXAwAgzgIAAIIEzgIi0AIAAIME0AIi0QIIAIQEACHSAgIA_gMAIdMCAQCjAwAhEIQCAQCMBAAhhwJAAI0EACGcAkAAjQQAIcQCAQCMBAAhxQIBAJYEACHGAgEAlgQAIccCAQCWBAAhyAIBAJYEACHJAgIA-gQAIcoCAQCWBAAhywIAAOIFACDMAgAA4wUAIM4CAADkBc4CItACAADlBdACItECCADmBQAh0gICAPoEACEC8AIBAAAABPoCAQAAAAUC8AIBAAAABPoCAQAAAAUB8AIAAADOAgIB8AIAAADQAgIF8AIIAAAAAfYCCAAAAAH3AggAAAAB-AIIAAAAAfkCCAAAAAETDwAA6AUAIBAAAOkFACAVAADqBQAghAIBAIwEACGHAkAAjQQAIZwCQACNBAAhxAIBAIwEACHFAgEAlgQAIcYCAQCWBAAhxwIBAJYEACHIAgEAlgQAIckCAgD6BAAhygIBAJYEACHLAgAA4gUAIMwCAADjBQAgzgIAAOQFzgIi0AIAAOUF0AIi0QIIAOYFACHSAgIA-gQAIQslAAD9BQAwJgAAgQYAMO0CAAD-BQAw7gIAAP8FADDvAgAAgAYAIPACAAD0BAAw8QIAAPQEADDyAgAA9AQAMPMCAAD0BAAw9AIAAIIGADD1AgAA9wQAMAslAAD0BQAwJgAA-AUAMO0CAAD1BQAw7gIAAPYFADDvAgAA9wUAIPACAACiBQAw8QIAAKIFADDyAgAAogUAMPMCAACiBQAw9AIAAPkFADD1AgAApQUAMAslAADrBQAwJgAA7wUAMO0CAADsBQAw7gIAAO0FADDvAgAA7gUAIPACAADRBAAw8QIAANEEADDyAgAA0QQAMPMCAADRBAAw9AIAAPAFADD1AgAA1AQAMAYGAAC9BQAgFAAA4QQAIIQCAQAAAAGFAgEAAAABpQIAAAClAgKmAkAAAAABAgAAACcAICUAAPMFACADAAAAJwAgJQAA8wUAICYAAPIFACABHgAAggcAMAIAAAAnACAeAADyBQAgAgAAANUEACAeAADxBQAgBIQCAQCMBAAhhQIBAIwEACGlAgAArASlAiKmAkAAjQQAIQYGAAC8BQAgFAAA2QQAIIQCAQCMBAAhhQIBAIwEACGlAgAArASlAiKmAkAAjQQAIQYGAAC9BQAgFAAA4QQAIIQCAQAAAAGFAgEAAAABpQIAAAClAgKmAkAAAAABBAYAAJAEACCEAgEAAAABhQIBAAAAAYcCQAAAAAECAAAADwAgJQAA_AUAIAMAAAAPACAlAAD8BQAgJgAA-wUAIAEeAACBBwAwAgAAAA8AIB4AAPsFACACAAAApgUAIB4AAPoFACADhAIBAIwEACGFAgEAjAQAIYcCQACNBAAhBAYAAI4EACCEAgEAjAQAIYUCAQCMBAAhhwJAAI0EACEEBgAAkAQAIIQCAQAAAAGFAgEAAAABhwJAAAAAAQ4GAACYBQAgCwAAnQUAIAwAAJoFACAOAACbBQAghAIBAAAAAYUCAQAAAAGHAkAAAAABnAJAAAAAAasCAAAAsQICrQICAAAAAa4CAACXBQAgrwIgAAAAAbECAgAAAAGyAgEAAAABAgAAABoAICUAAIUGACADAAAAGgAgJQAAhQYAICYAAIQGACABHgAAgAcAMAIAAAAaACAeAACEBgAgAgAAAPgEACAeAACDBgAgCoQCAQCMBAAhhQIBAIwEACGHAkAAjQQAIZwCQACNBAAhqwIAAPwEsQIirQICAPoEACGuAgAA-wQAIK8CIAC9BAAhsQICAPoEACGyAgEAlgQAIQ4GAACVBQAgCwAA_wQAIAwAAIAFACAOAACBBQAghAIBAIwEACGFAgEAjAQAIYcCQACNBAAhnAJAAI0EACGrAgAA_ASxAiKtAgIA-gQAIa4CAAD7BAAgrwIgAL0EACGxAgIA-gQAIbICAQCWBAAhDgYAAJgFACALAACdBQAgDAAAmgUAIA4AAJsFACCEAgEAAAABhQIBAAAAAYcCQAAAAAGcAkAAAAABqwIAAACxAgKtAgIAAAABrgIAAJcFACCvAiAAAAABsQICAAAAAbICAQAAAAETDwAAiQYAIBAAAIoGACAVAACLBgAghAIBAAAAAYcCQAAAAAGcAkAAAAABxAIBAAAAAcUCAQAAAAHGAgEAAAABxwIBAAAAAcgCAQAAAAHJAgIAAAABygIBAAAAAcsCAACHBgAgzAIAAIgGACDOAgAAAM4CAtACAAAA0AIC0QIIAAAAAdICAgAAAAEB8AIBAAAABAHwAgEAAAAEBCUAAP0FADDtAgAA_gUAMO8CAACABgAg8wIAAPQEADAEJQAA9AUAMO0CAAD1BQAw7wIAAPcFACDzAgAAogUAMAQlAADrBQAw7QIAAOwFADDvAgAA7gUAIPMCAADRBAAwBCUAANgFADDtAgAA2QUAMO8CAADbBQAg8wIAANwFADADJQAA_gYAIO0CAAD_BgAg8wIAAF0AIAAAAAAAAAclAAD5BgAgJgAA_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-BAAgCwAA_wQAIA4AAIEFACAeAACmBwAghAIBAIwEACGFAgEAjAQAIYYCAQCMBAAhhwJAAI0EACGcAkAAjQQAIasCAAD8BLECIq0CAgD6BAAhrgIAAPsEACCvAiAAvQQAIbECAgD6BAAhsgIBAJYEACEPBgAAlQUAIAoAAP4EACALAAD_BAAgDgAAgQUAIIQCAQCMBAAhhQIBAIwEACGGAgEAjAQAIYcCQACNBAAhnAJAAI0EACGrAgAA_ASxAiKtAgIA-gQAIa4CAAD7BAAgrwIgAL0EACGxAgIA-gQAIbICAQCWBAAhAwAAABMAICUAAJYHACAmAACpBwAgFgAAABMAIAkAAJQGACAQAADpBQAgFQAA6gUAIB4AAKkHACCEAgEAjAQAIYcCQACNBAAhnAJAAI0EACHEAgEAjAQAIcUCAQCWBAAhxgIBAJYEACHHAgEAlgQAIcgCAQCWBAAhyQICAPoEACHKAgEAlgQAIcsCAADiBQAgzAIAAOMFACDOAgAA5AXOAiLQAgAA5QXQAiLRAggA5gUAIdICAgD6BAAh0wIBAJYEACEUCQAAlAYAIBAAAOkFACAVAADqBQAghAIBAIwEACGHAkAAjQQAIZwCQACNBAAhxAIBAIwEACHFAgEAlgQAIcYCAQCWBAAhxwIBAJYEACHIAgEAlgQAIckCAgD6BAAhygIBAJYEACHLAgAA4gUAIMwCAADjBQAgzgIAAOQFzgIi0AIAAOUF0AIi0QIIAOYFACHSAgIA-gQAIdMCAQCWBAAhCoQCAQAAAAGGAgEAAAABhwJAAAAAAZwCQAAAAAGrAgAAALECAq0CAgAAAAGuAgAAlwUAIK8CIAAAAAGxAgIAAAABsgIBAAAAAQ8GAACYBQAgCgAAmQUAIAsAAJ0FACAMAACaBQAghAIBAAAAAYUCAQAAAAGGAgEAAAABhwJAAAAAAZwCQAAAAAGrAgAAALECAq0CAgAAAAGuAgAAlwUAIK8CIAAAAAGxAgIAAAABsgIBAAAAAQIAAAAaACAlAACrBwAgAwAAABgAICUAAKsHACAmAACvBwAgEQAAABgAIAYAAJUFACAKAAD-BAAgCwAA_wQAIAwAAIAFACAeAACvBwAghAIBAIwEACGFAgEAjAQAIYYCAQCMBAAhhwJAAI0EACGcAkAAjQQAIasCAAD8BLECIq0CAgD6BAAhrgIAAPsEACCvAiAAvQQAIbECAgD6BAAhsgIBAJYEACEPBgAAlQUAIAoAAP4EACALAAD_BAAgDAAAgAUAIIQCAQCMBAAhhQIBAIwEACGGAgEAjAQAIYcCQACNBAAhnAJAAI0EACGrAgAA_ASxAiKtAgIA-gQAIa4CAAD7BAAgrwIgAL0EACGxAgIA-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_LABAfQA9fgA-AAAAAAAFCAA8KwA_LABAfQA9fgA-AQMAAgEDAAIDCABFKwBGLABHAAAAAwgARSsARiwARwIGAAUNAAoCBgAFDQAKAwgATCsATSwATgAAAAMIAEwrAE0sAE4DBgAFEYsCDROMAg8DBgAFEZICDROTAg8FCABTKwBWLABXfQBUfgBVAAAAAAAFCABTKwBWLABXfQBUfgBVAwYABQoABwulAgoDBgAFCgAHC6sCCgUIAFwrAF8sAGB9AF1-AF4AAAAAAAUIAFwrAF8sAGB9AF1-AF4BBgAFAQYABQUIAGUrAGgsAGl9AGZ-AGcAAAAAAAUIAGUrAGgsAGl9AGZ-AGcCBgAFCgAHAgYABQoABwMIAG4rAG8sAHAAAAADCABuKwBvLABwAQMAAgEDAAIDCAB1KwB2LAB3AAAAAwgAdSsAdiwAdwIGAAUKAAcCBgAFCgAHAwgAfCsAfSwAfgAAAAMIAHwrAH0sAH4ZAgEaRwEbSQEcSgEdSwEfTQEgTxQhUBUiUgEjVBQkVRYnVgEoVwEpWBQtWxcuXBsvXgIwXwIxYgIyYwIzZAI0ZgI1aBQ2aRw3awI4bRQ5bh06bwI7cAI8cRQ9dB4-dSI_dgNAdwNBeANCeQNDegNEfANFfhRGfyNHgQEDSIMBFEmEASRKhQEDS4YBA0yHARRNigElTosBKU-MAQRQjQEEUY4BBFKPAQRTkAEEVJIBBFWUARRWlQEqV5cBBFiZARRZmgErWpsBBFucAQRcnQEUXaABLF6hATBfowExYKQBMWGnATFiqAExY6kBMWSrATFlrQEUZq4BMmewATFosgEUabMBM2q0ATFrtQExbLYBFG25ATRuugE4b7sBB3C8AQdxvQEHcr4BB3O_AQd0wQEHdcMBFHbEATl3xwEHeMkBFHnKATp6zAEHe80BB3zOARR_0QE7gAHSAUGBAdQBCIIB1QEIgwHXAQiEAdgBCIUB2QEIhgHbAQiHAd0BFIgB3gFCiQHgAQiKAeIBFIsB4wFDjAHkAQiNAeUBCI4B5gEUjwHpAUSQAeoBSJEB6wELkgHsAQuTAe0BC5QB7gELlQHvAQuWAfEBC5cB8wEUmAH0AUmZAfYBC5oB-AEUmwH5AUqcAfoBC50B-wELngH8ARSfAf8BS6ABgAJPoQGBAg6iAYICDqMBgwIOpAGEAg6lAYUCDqYBhwIOpwGJAhSoAYoCUKkBjgIOqgGQAhSrAZECUawBlAIOrQGVAg6uAZYCFK8BmQJSsAGaAlixAZsCCrIBnAIKswGdAgq0AZ4CCrUBnwIKtgGhAgq3AaMCFLgBpAJZuQGnAgq6AakCFLsBqgJavAGsAgq9Aa0CCr4BrgIUvwGxAlvAAbICYcEBswIPwgG0Ag_DAbUCD8QBtgIPxQG3Ag_GAbkCD8cBuwIUyAG8AmLJAb4CD8oBwAIUywHBAmPMAcICD80BwwIPzgHEAhTPAccCZNAByAJq0QHJAg3SAcoCDdMBywIN1AHMAg3VAc0CDdYBzwIN1wHRAhTYAdICa9kB1AIN2gHWAhTbAdcCbNwB2AIN3QHZAg3eAdoCFN8B3QJt4AHeAnHhAeACBeIB4QIF4wHjAgXkAeQCBeUB5QIF5gHnAgXnAekCFOgB6gJy6QHsAgXqAe4CFOsB7wJz7AHwAgXtAfECBe4B8gIU7wH1AnTwAfYCePEB9wIG8gH4AgbzAfkCBvQB-gIG9QH7Agb2Af0CBvcB_wIU-AGAA3n5AYIDBvoBhAMU-wGFA3r8AYYDBv0BhwMG_gGIAxT_AYsDe4ACjAN_"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_SECRET_KEY"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_FROM
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY
    },
    STRIPE: {
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
    }
  };
};
var envVars = loadEnvVariables();

// src/app/lib/prisma.ts
var connectionString = envVars.DATABASE_URL;
if (!connectionString.includes("sslmode")) {
  connectionString += connectionString.includes("?") ? "&" : "?";
  connectionString += "uselibpqcompat=true&sslmode=require";
} else if (!connectionString.includes("uselibpqcompat=")) {
  connectionString += "&uselibpqcompat=true";
}
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
import { bearer, emailOTP } from "better-auth/plugins";

// src/app/utils/email.ts
import nodemailer from "nodemailer";
import status2 from "http-status";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  }
});
var emailTemplates = {
  otp: (data) => `
<div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

    <h2 style="margin-top: 0; color: #111827;">
      Hello ${data.name},
    </h2>

    <p style="font-size: 14px; color: #4b5563;">
      Thank you for registering. Please use the verification code below to verify your email address.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="
        display: inline-block;
        padding: 12px 24px;
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 6px;
        background-color: #f3f4f6;
        border-radius: 6px;
        color: #111827;">
        ${data.otp}
      </span>
    </div>

    <p style="font-size: 13px; color: #6b7280;">
      This OTP is valid for a limited time. Do not share this code with anyone.
    </p>

    <p style="font-size: 13px; color: #6b7280; margin-top: 30px;">
      If you did not request this verification, please ignore this email.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
      \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} CineCraze. All rights reserved.
    </p>

  </div>
</div>`
};
var sendEmail = async ({ subject, templateName, templateData, to, attachments }) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new AppError_default(status2.BAD_REQUEST, `Email template '${templateName}' not found`);
    }
    const html = template(templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      }))
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, `Failed to send email: ${error.message}`);
  }
};

// src/app/lib/auth.ts
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: () => {
        return {
          role: Role.VIEWER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.VIEWER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes (120 seconds)
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 24 * 60 * 60,
    // 24 hours (86400 seconds)
    updateAge: 24 * 60 * 60,
    // 24 hours (86400 seconds)
    cookieCache: {
      enabled: true,
      maxAge: 24 * 60 * 60
      // 24 hours (86400 seconds)
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "https://cine-craze-api.vercel.app", envVars.FRONTEND_URL],
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: envVars.NODE_ENV === "production",
    disableCSRFCheck: true,
    // Allow requests without Origin header (Postman, mobile apps, etc.)
    cookies: {
      state: {
        attributes: {
          sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
          secure: envVars.NODE_ENV === "production",
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
          secure: envVars.NODE_ENV === "production",
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/cookie.ts
var setCookie = (res, name, value, options) => {
  res.cookie(name, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var cookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/config/tokenConstants.ts
var TOKEN_EXPIRATION = {
  // OTP expires in 2 minutes
  OTP: 2 * 60,
  // 120 seconds
  // Access token expires in 15 minutes
  ACCESS_TOKEN: 15 * 60,
  // 900 seconds
  // Refresh token expires in 7 days
  REFRESH_TOKEN: 7 * 24 * 60 * 60,
  // 604800 seconds
  // Session token expires in 24 hours
  SESSION_TOKEN: 24 * 60 * 60
  // 86400 seconds
};
var COOKIE_MAX_AGE = {
  // Access token cookie: 15 minutes
  ACCESS_TOKEN: TOKEN_EXPIRATION.ACCESS_TOKEN * 1e3,
  // 900000 ms
  // Refresh token cookie: 7 days
  REFRESH_TOKEN: TOKEN_EXPIRATION.REFRESH_TOKEN * 1e3,
  // 604800000 ms
  // Session token cookie: 24 hours
  SESSION_TOKEN: TOKEN_EXPIRATION.SESSION_TOKEN * 1e3
  // 86400000 ms
};

// src/app/utils/token.ts
var isProduction = envVars.NODE_ENV === "production";
var baseCookieOptions = {
  httpOnly: true,
  path: "/",
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax"
};
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN });
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN });
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  cookieUtils.setCookie(res, "accessToken", token, {
    ...baseCookieOptions,
    // 15 minutes
    maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN
  });
};
var setRefreshTokenCookie = (res, token) => {
  cookieUtils.setCookie(res, "refreshToken", token, {
    ...baseCookieOptions,
    // 7 days
    maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    ...baseCookieOptions,
    // 24 hours
    maxAge: COOKIE_MAX_AGE.SESSION_TOKEN
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
  baseCookieOptions
};

// src/app/modules/auth/auth.service.ts
var registerViewer = async (payload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
    }
  });
  if (!data.user) {
    throw new AppError_default(status3.NOT_FOUND, "User Not Found");
  }
  try {
    const viewer = await prisma.$transaction(async (tx) => {
      const viewerTx = await tx.viewer.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email
        }
      });
      return viewerTx;
    });
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    });
    return {
      ...data,
      viewer,
      accessToken,
      refreshToken
    };
  } catch (error) {
    await prisma.user.delete({
      where: {
        id: data.user.id
      }
    });
    throw error;
  }
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExist = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExist) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid Session Token");
  }
  const verifiedRefershToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verifiedRefershToken) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid Refresh Token");
  }
  const data = verifiedRefershToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.id,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.id,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var getMe = async (user) => {
  const userExist = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      viewer: {
        include: {
          reviews: true,
          likes: true,
          tickets: true
        }
      },
      contentManager: {
        include: {
          contents: true
        }
      },
      admin: true
    }
  });
  if (!userExist) {
    throw new AppError_default(status3.NOT_FOUND, "User Not Found");
  }
  return userExist;
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var varifyEmail = async (email, otp) => {
  console.log(email, otp);
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var resendVerificationOtp = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User Not Found");
  }
  if (isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email is already verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User Not Found");
  }
  await auth.api.sendVerificationOTP({
    body: {
      email,
      type: "email-verification"
    }
  });
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User Not Found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email is not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User Not Found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var googleLoginSuccess = async (session) => {
  const isViewerExists = await prisma.viewer.findUnique({
    where: {
      userId: session.user.id
    }
  });
  if (!isViewerExists) {
    await prisma.viewer.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var AuthService = {
  registerViewer,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  varifyEmail,
  resendVerificationOtp,
  forgetPassword,
  resetPassword,
  googleLoginSuccess
};

// src/app/modules/auth/auth.controller.ts
import status4 from "http-status";
var registerViewer2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await AuthService.registerViewer(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status4.CREATED,
      success: true,
      message: "Patient registered successfully",
      data: {
        ...rest,
        token,
        accessToken,
        refreshToken
      }
    });
  }
);
var loginUser2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest
      }
    });
  }
);
var getMe2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User fetched successfully",
      data: result
    });
  }
);
var getNewToken2 = catchAsync(
  async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError_default(status4.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);
    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    });
  }
);
var changePassword2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.changePassword(payload, betterAuthSessionToken);
    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Password changed successfully",
      data: result
    });
  }
);
var logoutUser2 = catchAsync(
  async (req, res) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    cookieUtils.clearCookie(res, "accessToken", tokenUtils.baseCookieOptions);
    cookieUtils.clearCookie(res, "refreshToken", tokenUtils.baseCookieOptions);
    cookieUtils.clearCookie(res, "better-auth.session_token", tokenUtils.baseCookieOptions);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "User logged out successfully",
      data: result
    });
  }
);
var verifyEmail = catchAsync(
  async (req, res) => {
    const { email, otp } = req.body;
    await AuthService.varifyEmail(email, otp);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Email verified successfully"
    });
  }
);
var forgetPassword2 = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "A password reset OTP has been sent to your email address. Please check your inbox."
    });
  }
);
var resetPassword2 = catchAsync(
  async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password."
    });
  }
);
var resendVerificationOtp2 = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    await AuthService.resendVerificationOtp(email);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "A new verification OTP has been sent to your email address."
    });
  }
);
var googleLogin = catchAsync((req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Login</title>
</head>
<body>
    <div>
        <p>Redirecting To Google...</p>
    </div>
</body>
<script>
    (async () => {
        try {
            const response = await fetch("${envVars.BETTER_AUTH_URL}/api/auth/sign-in/social", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    provider: "google",
                    callbackURL: "${callbackURL}"
                })
            });

            const data = await response.json();

            if(data.url){
                window.location.href = data.url;
            }else{
                document.body.innerHTML = \`<div>
                    <p>Error Occurred While Redirecting To Google. Please Try Again Later.</p>
                </div>\`;
            }
        } catch (error) {
            document.body.innerHTML = \`<div>
                <p>Error Occurred While Redirecting To Google. Please Try Again Later.</p>
                \${error.message}
            </div>\`;
        }
    })()
</script>
</html>`;
  res.status(200).send(html);
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      "Cookie": `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await AuthService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});
var handleOAuthError = catchAsync((req, res) => {
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  registerViewer: registerViewer2,
  loginUser: loginUser2,
  getMe: getMe2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  verifyEmail,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  handleOAuthError,
  resendVerificationOtp: resendVerificationOtp2
};

// src/app/middleware/checkAuth.ts
import status5 from "http-status";
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");
    if (!sessionToken) {
      throw new Error("Unauthorized access! No session token provided.");
    }
    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
          console.log("Session Expiring Soon!!");
        }
        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
          throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! User is not active.");
        }
        if (user.isDeleted) {
          throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! User is deleted.");
        }
        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError_default(status5.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }
        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email
        };
      }
      const accessToken2 = cookieUtils.getCookie(req, "accessToken");
      if (!accessToken2) {
        throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! No access token provided.");
      }
    }
    const accessToken = cookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! No access token provided.");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
    }
    if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role)) {
      throw new AppError_default(status5.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/modules/auth/auth.route.ts
var router = Router();
router.post("/register", AuthController.registerViewer);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewToken);
router.get("/me", checkAuth(Role.ADMIN, Role.VIEWER, Role.CONTENT_MANAGER, Role.SUPER_ADMIN), AuthController.getMe);
router.post("/change-password", checkAuth(Role.ADMIN, Role.VIEWER, Role.CONTENT_MANAGER, Role.SUPER_ADMIN), AuthController.changePassword);
router.post("/logout", checkAuth(Role.ADMIN, Role.VIEWER, Role.CONTENT_MANAGER, Role.SUPER_ADMIN), AuthController.logoutUser);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification-otp", AuthController.resendVerificationOtp);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
var AuthRoutes = router;

// src/app/modules/users/user.route.ts
import { Router as Router2 } from "express";

// src/app/modules/users/user.service.ts
import status6 from "http-status";
var createManager = async (payload) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.contentManager.email
    }
  });
  if (userExists) {
    throw new AppError_default(status6.CONFLICT, `User with email ${payload.contentManager.email} already exists`);
  }
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.contentManager.email,
      password: payload.password,
      role: Role.CONTENT_MANAGER,
      name: payload.contentManager.name,
      needPasswordChange: true
    }
  });
  if (!userData.user) {
    throw new AppError_default(status6.INTERNAL_SERVER_ERROR, "Failed to create user in auth system");
  }
  try {
    const manager = await prisma.$transaction(async (tx) => {
      const managerData = await tx.contentManager.create({
        data: {
          userId: userData.user.id,
          ...payload.contentManager
        }
      });
      return await tx.contentManager.findUnique({
        where: {
          id: managerData.id
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          contactNumber: true,
          profilePhoto: true,
          gender: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
    });
    return manager;
  } catch (error) {
    if (envVars.NODE_ENV === "development") {
      console.error("Error creating manager:", error);
    }
    await prisma.user.delete({
      where: {
        id: userData.user.id
      }
    }).catch(console.error);
  }
};
var managerService = {
  createManager
};

// src/app/modules/users/user.controller.ts
import status7 from "http-status";
var createManager2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const manager = await managerService.createManager(payload);
    sendResponse(res, {
      httpStatusCode: status7.CREATED,
      success: true,
      message: "Manager created successfully",
      data: manager
    });
  }
);
var managerController = {
  createManager: createManager2
};

// src/app/middleware/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    const parsedResult = zodSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/app/modules/users/user.validation.ts
import z from "zod";
var createManagerZodSchema = z.object({
  password: z.string("Password is required").min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
  contentManager: z.object({
    name: z.string("Name is required and must be string").min(5, "Name must be at least 5 characters").max(30, "Name must be at most 30 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z.string("Contact number is required").min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters"),
    gender: z.enum([Gender.MALE, Gender.FEMALE], "Gender must be either MALE or FEMALE")
  })
});

// src/app/modules/users/user.route.ts
var router2 = Router2();
router2.post("/create-manager", validateRequest(createManagerZodSchema), managerController.createManager);
var UserRoutes = router2;

// src/app/modules/admin/admin.route.ts
import { Router as Router3 } from "express";

// src/app/modules/admin/admin.controller.ts
import status9 from "http-status";

// src/app/modules/admin/admin.service.ts
import status8 from "http-status";
var getAllAdmins = async () => {
  const admins = await prisma.admin.findMany({
    include: {
      user: true
    }
  });
  return admins;
};
var getAdminById = async (id) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id
    },
    include: {
      user: true
    }
  });
  return admin;
};
var updateAdmin = async (id, payload) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id
    }
  });
  if (!isAdminExist) {
    throw new AppError_default(status8.NOT_FOUND, "Admin Or Super Admin not found");
  }
  const { admin } = payload;
  const updatedAdmin = await prisma.admin.update({
    where: {
      id
    },
    data: {
      ...admin
    }
  });
  return updatedAdmin;
};
var deleteAdmin = async (id, user) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id
    }
  });
  if (!isAdminExist) {
    throw new AppError_default(status8.NOT_FOUND, "Admin Or Super Admin not found");
  }
  if (isAdminExist.id === user.userId) {
    throw new AppError_default(status8.BAD_REQUEST, "You cannot delete yourself");
  }
  const result = await prisma.$transaction(
    async (tx) => {
      await tx.admin.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: /* @__PURE__ */ new Date()
        }
      });
      await tx.user.update({
        where: { id: isAdminExist.userId },
        data: {
          isDeleted: true,
          deletedAt: /* @__PURE__ */ new Date(),
          status: UserStatus.DELETED
          // Optional: you may also want to block the user
        }
      });
      await tx.session.deleteMany({
        where: { userId: isAdminExist.userId }
      });
      await tx.account.deleteMany({
        where: { userId: isAdminExist.userId }
      });
      const admin = await getAdminById(id);
      return admin;
    }
  );
  return result;
};
var AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
};

// src/app/modules/admin/admin.controller.ts
var getAllAdmins2 = catchAsync(
  async (req, res) => {
    const result = await AdminService.getAllAdmins();
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Admins fetched successfully",
      data: result
    });
  }
);
var getAdminById2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const admin = await AdminService.getAdminById(id);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Admin fetched successfully",
      data: admin
    });
  }
);
var updateAdmin2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedAdmin = await AdminService.updateAdmin(id, payload);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Admin updated successfully",
      data: updatedAdmin
    });
  }
);
var deleteAdmin2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await AdminService.deleteAdmin(id, user);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Admin deleted successfully",
      data: result
    });
  }
);
var AdminController = {
  getAllAdmins: getAllAdmins2,
  updateAdmin: updateAdmin2,
  deleteAdmin: deleteAdmin2,
  getAdminById: getAdminById2
};

// src/app/modules/admin/admin.validation.ts
import z2 from "zod";
var updateAdminZodSchema = z2.object({
  admin: z2.object({
    name: z2.string("Name must be a string").optional(),
    profilePhoto: z2.url("Profile photo must be a valid URL").optional(),
    contactNumber: z2.string("Contact number must be a string").min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 15 characters").optional()
  }).optional()
});

// src/app/modules/admin/admin.route.ts
var router3 = Router3();
router3.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAllAdmins
);
router3.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAdminById
);
router3.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updateAdminZodSchema),
  AdminController.updateAdmin
);
router3.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  AdminController.deleteAdmin
);
var AdminRoutes = router3;

// src/app/modules/content/content.route.ts
import { Router as Router4 } from "express";

// src/app/config/multer.config.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// src/app/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status10 from "http-status";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var deleteFileFromCloudinary = async (url) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image"
        }
      );
      console.log(`File ${publicId} deleted from cloudinary`);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError_default(status10.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary");
  }
};
var cloudinaryUpload = cloudinary;

// src/app/config/multer.config.ts
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extension === "pdf" ? "pdfs" : "images";
    return {
      folder: `content-poster/${folder}`,
      public_id: uniqueName,
      resource_type: file.mimetype === "application/pdf" ? "raw" : "auto"
    };
  }
});
var multerUpload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }
  // 4MB max file size (Vercel serverless limit)
});

// src/app/modules/content/content.controller.ts
import status12 from "http-status";

// src/app/modules/content/content.service.ts
import status11 from "http-status";

// src/app/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  query;
  countQuery;
  page = 1;
  limit = 10;
  skip = 0;
  sortBy = "createdAt";
  sortOrder = "desc";
  selectFields;
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include", "genre"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = { ...this.query.include, ...result };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(this.query.where, condition);
    this.countQuery.where = this.deepMerge(this.countQuery.where, condition);
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(this.query)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(this.countQuery);
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/app/modules/content/content.constant.ts
var contentSearchableFields = [
  "id",
  "title",
  "cast",
  "director"
];
var contentFilterableFields = [
  "id",
  "managerId",
  "genre",
  "releaseDate",
  "mediaType",
  "ticketPrice",
  "createdAt",
  "updatedAt"
];
var contentIncludeConfig = {
  _count: {
    select: {
      reviews: true
    }
  },
  reviews: {
    include: {
      viewer: {
        select: {
          id: true,
          name: true,
          profilePhoto: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      },
      replies: {
        include: {
          viewer: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          }
        }
      }
    }
  }
};

// src/app/modules/content/content.service.ts
var createContent = async (payload, user) => {
  if (user.role !== Role.CONTENT_MANAGER && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    throw new AppError_default(status11.FORBIDDEN, "Only content managers or admins can create content");
  }
  const manager = await prisma.contentManager.findUnique({
    where: {
      userId: user.userId
    }
  });
  const data = {
    ...payload,
    mediaType: payload.mediaType ?? MediaType.MOVIE,
    accessType: payload.accessType ?? AccessType.FREE,
    ticketPrice: payload.ticketPrice ?? null,
    ...manager ? { manager: { connect: { id: manager.id } } } : {}
  };
  const content = await prisma.content.create({
    data
  });
  return content;
};
var getAllContents = async (query) => {
  const { genre } = query;
  const queryBuilder = new QueryBuilder(prisma.content, query, {
    filterableFields: contentFilterableFields,
    searchableFields: contentSearchableFields
  });
  const result = await queryBuilder.search().filter().paginate().dynamicInclude(contentIncludeConfig).sort().execute();
  if (genre && result.data.length > 0) {
    const genreList = genre.split(",").map((g) => g.trim());
    result.data = result.data.filter(
      (content) => genreList.every(
        (selectedGenre) => content.genres.includes(selectedGenre)
      )
    );
    result.meta.total = result.data.length;
    result.meta.totalPages = Math.ceil(result.data.length / result.meta.limit);
  }
  return result;
};
var getMyContents = async (user, query) => {
  if (user.role !== Role.CONTENT_MANAGER && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    throw new AppError_default(status11.FORBIDDEN, "Only content managers or admins can access this resource");
  }
  if (user.role === Role.CONTENT_MANAGER) {
    const manager = await prisma.contentManager.findUnique({
      where: {
        userId: user.userId
      }
    });
    if (!manager) {
      throw new AppError_default(status11.NOT_FOUND, "Content manager not found");
    }
    query.managerId = manager.id;
  }
  const { genre } = query;
  const queryBuilder = new QueryBuilder(prisma.content, query, {
    filterableFields: contentFilterableFields,
    searchableFields: contentSearchableFields
  });
  const result = await queryBuilder.search().filter().paginate().dynamicInclude(contentIncludeConfig).sort().execute();
  if (genre && result.data.length > 0) {
    const genreList = genre.split(",").map((g) => g.trim());
    result.data = result.data.filter(
      (content) => genreList.every(
        (selectedGenre) => content.genres.includes(selectedGenre)
      )
    );
    result.meta.total = result.data.length;
    result.meta.totalPages = Math.ceil(result.data.length / result.meta.limit);
  }
  return result;
};
var getContentById = async (id) => {
  const content = await prisma.content.findUnique({
    where: { id }
  });
  if (!content) {
    throw new AppError_default(status11.NOT_FOUND, "Content not found");
  }
  return content;
};
var updateContent = async (id, payload, user) => {
  const existing = await prisma.content.findUnique({
    where: { id }
  });
  if (!existing) {
    throw new AppError_default(status11.NOT_FOUND, "Content not found");
  }
  if (user.role === Role.CONTENT_MANAGER) {
    const manager = await prisma.contentManager.findUnique({
      where: {
        userId: user.userId
      }
    });
    if (!manager || existing.managerId !== manager.id) {
      throw new AppError_default(status11.FORBIDDEN, "You are not allowed to modify this content");
    }
  }
  const updated = await prisma.content.update({
    where: { id },
    data: payload
  });
  return updated;
};
var deleteContent = async (id, user) => {
  const existing = await prisma.content.findUnique({
    where: { id }
  });
  if (!existing) {
    throw new AppError_default(status11.NOT_FOUND, "Content not found");
  }
  if (user.role === Role.CONTENT_MANAGER) {
    const manager = await prisma.contentManager.findUnique({
      where: {
        userId: user.userId
      }
    });
    if (!manager || existing.managerId !== manager.id) {
      throw new AppError_default(status11.FORBIDDEN, "You are not allowed to delete this content");
    }
  }
  await prisma.content.delete({
    where: { id }
  });
  return null;
};
var canViewerWatchContent = async (contentId, user) => {
  const content = await prisma.content.findUnique({
    where: { id: contentId }
  });
  if (!content) {
    throw new AppError_default(status11.NOT_FOUND, "Content not found");
  }
  if (content.accessType === AccessType.FREE) {
    return content;
  }
  const viewer = await prisma.viewer.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!viewer) {
    throw new AppError_default(status11.FORBIDDEN, "Only viewers can access content");
  }
  if (content.accessType === AccessType.SUBSCRIPTION) {
    const now = /* @__PURE__ */ new Date();
    if (!viewer.subscriptionEnds || viewer.subscriptionEnds < now) {
      throw new AppError_default(status11.FORBIDDEN, "Subscription required or expired");
    }
    return content;
  }
  if (content.accessType === AccessType.TICKET) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        viewerId: viewer.id,
        contentId: content.id,
        paymentStatus: PaymentStatus.PAID
      }
    });
    if (!ticket) {
      throw new AppError_default(status11.FORBIDDEN, "Valid ticket required to watch this content");
    }
    return content;
  }
  if (content.accessType === AccessType.BOTH) {
    const hasActiveSubscription = !!viewer.subscriptionEnds && viewer.subscriptionEnds >= /* @__PURE__ */ new Date();
    if (hasActiveSubscription) {
      return content;
    }
    const ticket = await prisma.ticket.findFirst({
      where: {
        viewerId: viewer.id,
        contentId: content.id,
        paymentStatus: PaymentStatus.PAID
      }
    });
    if (!ticket) {
      throw new AppError_default(status11.FORBIDDEN, "Subscription or valid ticket required to watch this content");
    }
  }
  return content;
};
var ContentService = {
  createContent,
  getAllContents,
  getMyContents,
  getContentById,
  updateContent,
  deleteContent,
  canViewerWatchContent
};

// src/app/modules/content/content.validation.ts
import z3 from "zod";
var createContentZodSchema = z3.object({
  title: z3.string().min(1, "Title is required"),
  description: z3.string().optional(),
  posterUrl: z3.string().url().optional(),
  trailerUrl: z3.string().url().optional(),
  streamingUrl: z3.string().url().optional(),
  releaseYear: z3.number().int().min(1888, "Release year is not valid"),
  director: z3.string().optional(),
  cast: z3.array(z3.string()).default([]),
  genres: z3.array(z3.string()).default([]),
  mediaType: z3.nativeEnum(MediaType).optional(),
  accessType: z3.nativeEnum(AccessType).optional(),
  ticketPrice: z3.number().nonnegative().nullable().optional()
});
var updateContentZodSchema = createContentZodSchema.partial();

// src/app/modules/content/content.controller.ts
var parseStringArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return void 0;
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [trimmed];
  } catch {
    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
  }
};
var normalizeContentPayload = (req) => {
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;
  const normalizedPayload = { ...body };
  if (typeof body.releaseYear === "string") {
    normalizedPayload.releaseYear = Number(body.releaseYear);
  }
  if (typeof body.ticketPrice === "string") {
    normalizedPayload.ticketPrice = body.ticketPrice === "" ? null : Number(body.ticketPrice);
  }
  if (body.cast !== void 0) {
    normalizedPayload.cast = parseStringArray(body.cast);
  }
  if (body.genres !== void 0) {
    normalizedPayload.genres = parseStringArray(body.genres);
  }
  return normalizedPayload;
};
var createContent2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const payload = createContentZodSchema.parse(normalizeContentPayload(req));
    const files = req.files;
    const posterFile = files?.posterImage?.[0];
    if (posterFile?.path) {
      payload.posterUrl = posterFile.path;
    }
    const content = await ContentService.createContent(payload, user);
    sendResponse(res, {
      httpStatusCode: status12.CREATED,
      success: true,
      message: "Content created successfully",
      data: content
    });
  }
);
var getAllContents2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ContentService.getAllContents(query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status12.OK,
    message: "All content retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getContentById2 = catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const content = await ContentService.getContentById(id);
    sendResponse(res, {
      httpStatusCode: status12.OK,
      success: true,
      message: "Content fetched successfully",
      data: content
    });
  }
);
var updateContent2 = catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const payload = updateContentZodSchema.parse(normalizeContentPayload(req));
    const files = req.files;
    const posterFile = files?.posterImage?.[0];
    if (posterFile?.path) {
      payload.posterUrl = posterFile.path;
    }
    console.log("Normalized Payload in Controller:", payload);
    const content = await ContentService.updateContent(id, payload, user);
    sendResponse(res, {
      httpStatusCode: status12.OK,
      success: true,
      message: "Content updated successfully",
      data: content
    });
  }
);
var deleteContent2 = catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const existing = await ContentService.getContentById(id);
    if (existing.posterUrl) {
      try {
        await deleteFileFromCloudinary(existing.posterUrl);
      } catch (error) {
        console.error("Failed to delete poster from Cloudinary:", error);
      }
    }
    await ContentService.deleteContent(id, user);
    sendResponse(res, {
      httpStatusCode: status12.OK,
      success: true,
      message: "Content deleted successfully",
      data: null
    });
  }
);
var getWatchableContent = catchAsync(
  async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const content = await ContentService.canViewerWatchContent(id, user);
    sendResponse(res, {
      httpStatusCode: status12.OK,
      success: true,
      message: "Content is accessible",
      data: content
    });
  }
);
var getMyContents2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const query = req.query;
    const result = await ContentService.getMyContents(user, query);
    sendResponse(res, {
      success: true,
      httpStatusCode: status12.OK,
      message: "My contents retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var ContentController = {
  createContent: createContent2,
  getAllContents: getAllContents2,
  getMyContents: getMyContents2,
  getContentById: getContentById2,
  updateContent: updateContent2,
  deleteContent: deleteContent2,
  getWatchableContent
};

// src/app/modules/content/content.route.ts
var router4 = Router4();
router4.get("/", ContentController.getAllContents);
router4.get(
  "/my-contents",
  checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
  ContentController.getMyContents
);
router4.get(
  "/:id/watch",
  checkAuth(Role.VIEWER, Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
  ContentController.getWatchableContent
);
router4.get("/:id", ContentController.getContentById);
router4.post(
  "/",
  checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.fields([
    { name: "posterImage", maxCount: 1 }
  ]),
  ContentController.createContent
);
router4.patch(
  "/:id",
  checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.fields([
    { name: "posterImage", maxCount: 1 }
  ]),
  ContentController.updateContent
);
router4.delete(
  "/:id",
  checkAuth(Role.CONTENT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN),
  ContentController.deleteContent
);
var ContentRoutes = router4;

// src/app/modules/contentManager/contentManager.route.ts
import { Router as Router5 } from "express";

// src/app/modules/contentManager/contentManager.controller.ts
import status14 from "http-status";

// src/app/modules/contentManager/contentManager.service.ts
import status13 from "http-status";
var getAllContentManagers = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.contentManager, query, {
    searchableFields: ["name", "email", "user.email", "user.name"]
  });
  const result = await queryBuilder.search().filter().paginate().dynamicInclude({
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true
      }
    }
  }, ["user"]).sort().execute();
  return result;
};
var getContentManagerById = async (id) => {
  const manager = await prisma.contentManager.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          image: true,
          status: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
  if (!manager) {
    throw new AppError_default(status13.NOT_FOUND, "Content manager not found");
  }
  return manager;
};
var updateContentManager = async (id, payload) => {
  const existing = await prisma.contentManager.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError_default(status13.NOT_FOUND, "Content manager not found");
  }
  const { contentManager } = payload;
  const updated = await prisma.contentManager.update({
    where: { id },
    data: {
      ...contentManager
    }
  });
  return updated;
};
var deleteContentManager = async (id, user) => {
  const existing = await prisma.contentManager.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError_default(status13.NOT_FOUND, "Content manager not found");
  }
  if (existing.id === user.userId) {
    throw new AppError_default(status13.BAD_REQUEST, "You cannot delete yourself");
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.contentManager.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.user.update({
      where: { id: existing.userId },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.session.deleteMany({ where: { userId: existing.userId } });
    await tx.account.deleteMany({ where: { userId: existing.userId } });
    const manager = await getContentManagerById(id);
    return manager;
  });
  return result;
};
var ContentManagerService = {
  getAllContentManagers,
  getContentManagerById,
  updateContentManager,
  deleteContentManager
};

// src/app/modules/contentManager/contentManager.controller.ts
var getAllContentManagers2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ContentManagerService.getAllContentManagers(query);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Content managers fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getContentManagerById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const manager = await ContentManagerService.getContentManagerById(id);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Content manager fetched successfully",
    data: manager
  });
});
var updateContentManager2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updated = await ContentManagerService.updateContentManager(id, payload);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Content manager updated successfully",
    data: updated
  });
});
var deleteContentManager2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const result = await ContentManagerService.deleteContentManager(id, user);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Content manager deleted successfully",
    data: result
  });
});
var ContentManagerController = {
  getAllContentManagers: getAllContentManagers2,
  getContentManagerById: getContentManagerById2,
  updateContentManager: updateContentManager2,
  deleteContentManager: deleteContentManager2
};

// src/app/modules/contentManager/contentManager.validation.ts
import z4 from "zod";
var updateContentManagerZodSchema = z4.object({
  contentManager: z4.object({
    name: z4.string().min(1).optional(),
    contactNumber: z4.string().min(7).optional(),
    gender: z4.enum([Gender.MALE, Gender.FEMALE]).optional()
  }).optional()
});

// src/app/modules/contentManager/contentManager.route.ts
var router5 = Router5();
router5.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ContentManagerController.getAllContentManagers
);
router5.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ContentManagerController.getContentManagerById
);
router5.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updateContentManagerZodSchema),
  ContentManagerController.updateContentManager
);
router5.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  ContentManagerController.deleteContentManager
);
var ContentManagerRoutes = router5;

// src/app/modules/watchlist/watchlist.route.ts
import { Router as Router6 } from "express";

// src/app/modules/watchlist/watchlist.controller.ts
import status16 from "http-status";

// src/app/modules/watchlist/watchlist.service.ts
import status15 from "http-status";
var getViewerOrThrow = async (user) => {
  const viewer = await prisma.viewer.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!viewer) {
    throw new AppError_default(status15.FORBIDDEN, "Viewer not found");
  }
  return viewer;
};
var addToWatchlist = async (contentId, user) => {
  const viewer = await getViewerOrThrow(user);
  const content = await prisma.content.findUnique({
    where: { id: contentId }
  });
  if (!content) {
    throw new AppError_default(status15.NOT_FOUND, "Content not found");
  }
  const watchlistItem = await prisma.watchlist.upsert({
    where: {
      viewerId_contentId: {
        viewerId: viewer.id,
        contentId
      }
    },
    update: {},
    create: {
      viewerId: viewer.id,
      contentId
    },
    include: {
      content: true
    }
  });
  return watchlistItem;
};
var getMyWatchlist = async (user) => {
  const viewer = await getViewerOrThrow(user);
  const watchlist = await prisma.watchlist.findMany({
    where: {
      viewerId: viewer.id
    },
    include: {
      content: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return watchlist;
};
var removeFromWatchlist = async (contentId, user) => {
  const viewer = await getViewerOrThrow(user);
  const watchlistItem = await prisma.watchlist.findUnique({
    where: {
      viewerId_contentId: {
        viewerId: viewer.id,
        contentId
      }
    }
  });
  if (!watchlistItem) {
    throw new AppError_default(status15.NOT_FOUND, "Watchlist item not found");
  }
  await prisma.watchlist.delete({
    where: {
      viewerId_contentId: {
        viewerId: viewer.id,
        contentId
      }
    }
  });
  return null;
};
var WatchlistService = {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist
};

// src/app/modules/watchlist/watchlist.controller.ts
var addToWatchlist2 = catchAsync(async (req, res) => {
  const user = req.user;
  const { contentId } = req.body;
  const result = await WatchlistService.addToWatchlist(contentId, user);
  sendResponse(res, {
    httpStatusCode: status16.CREATED,
    success: true,
    message: "Content added to watchlist successfully",
    data: result
  });
});
var getMyWatchlist2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await WatchlistService.getMyWatchlist(user);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Watchlist fetched successfully",
    data: result
  });
});
var removeFromWatchlist2 = catchAsync(async (req, res) => {
  const user = req.user;
  const contentId = req.params.contentId;
  await WatchlistService.removeFromWatchlist(contentId, user);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Content removed from watchlist successfully",
    data: null
  });
});
var WatchlistController = {
  addToWatchlist: addToWatchlist2,
  getMyWatchlist: getMyWatchlist2,
  removeFromWatchlist: removeFromWatchlist2
};

// src/app/modules/watchlist/watchlist.validation.ts
import z5 from "zod";
var addToWatchlistZodSchema = z5.object({
  contentId: z5.string().min(1, "Content id is required")
});

// src/app/modules/watchlist/watchlist.route.ts
var router6 = Router6();
router6.get("/", checkAuth(Role.VIEWER), WatchlistController.getMyWatchlist);
router6.post("/", checkAuth(Role.VIEWER), validateRequest(addToWatchlistZodSchema), WatchlistController.addToWatchlist);
router6.delete("/:contentId", checkAuth(Role.VIEWER), WatchlistController.removeFromWatchlist);
var WatchlistRoutes = router6;

// src/app/modules/review/review.route.ts
import { Router as Router7 } from "express";

// src/app/modules/review/review.controller.ts
import status18 from "http-status";

// src/app/modules/review/review.service.ts
import status17 from "http-status";
var getViewerOrThrow2 = async (user) => {
  const viewer = await prisma.viewer.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!viewer) {
    throw new AppError_default(status17.FORBIDDEN, "Viewer not found");
  }
  return viewer;
};
var createReview = async (payload, user) => {
  const viewer = await getViewerOrThrow2(user);
  const content = await prisma.content.findUnique({
    where: { id: payload.contentId }
  });
  if (!content) {
    throw new AppError_default(status17.NOT_FOUND, "Content not found");
  }
  if (payload.parentId) {
    const parentReview = await prisma.review.findUnique({
      where: { id: payload.parentId }
    });
    if (!parentReview) {
      throw new AppError_default(status17.NOT_FOUND, "Parent review not found");
    }
  }
  const review = await prisma.review.create({
    data: {
      viewerId: viewer.id,
      contentId: payload.contentId,
      rating: payload.rating,
      tags: payload.tags,
      hasSpoiler: payload.hasSpoiler ?? false,
      parentId: payload.parentId,
      status: ReviewStatus.APPROVED
    },
    include: {
      viewer: true,
      replies: true,
      likes: true
    }
  });
  return review;
};
var getReviewsByContent = async (contentId) => {
  const content = await prisma.content.findUnique({
    where: { id: contentId }
  });
  if (!content) {
    throw new AppError_default(status17.NOT_FOUND, "Content not found");
  }
  const reviews = await prisma.review.findMany({
    where: {
      contentId,
      parentId: null,
      status: ReviewStatus.APPROVED
    },
    include: {
      viewer: true,
      likes: true,
      replies: {
        include: {
          viewer: true,
          likes: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  const averageRatingAggregate = await prisma.review.aggregate({
    where: {
      contentId,
      parentId: null,
      status: ReviewStatus.APPROVED
    },
    _avg: {
      rating: true
    },
    _count: {
      id: true
    }
  });
  return {
    averageRating: averageRatingAggregate._avg.rating ?? 0,
    totalReviews: averageRatingAggregate._count.id,
    reviews
  };
};
var updateReview = async (reviewId, payload, user) => {
  const viewer = await getViewerOrThrow2(user);
  const existing = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!existing) {
    throw new AppError_default(status17.NOT_FOUND, "Review not found");
  }
  if (existing.viewerId !== viewer.id) {
    throw new AppError_default(status17.FORBIDDEN, "You can only update your own review");
  }
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: payload
  });
  return review;
};
var deleteReview = async (reviewId, user) => {
  const viewer = await getViewerOrThrow2(user);
  const existing = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!existing) {
    throw new AppError_default(status17.NOT_FOUND, "Review not found");
  }
  if (existing.viewerId !== viewer.id) {
    throw new AppError_default(status17.FORBIDDEN, "You can only delete your own review");
  }
  await prisma.review.delete({
    where: { id: reviewId }
  });
  return null;
};
var getMyReviews = async (user) => {
  const viewer = await getViewerOrThrow2(user);
  const reviews = await prisma.review.findMany({
    where: {
      viewerId: viewer.id,
      parentId: null
      // Only top-level reviews
    },
    include: {
      viewer: true,
      content: true,
      likes: true,
      replies: {
        include: {
          viewer: true,
          likes: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return reviews;
};
var toggleLike = async (reviewId, user) => {
  const viewer = await getViewerOrThrow2(user);
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new AppError_default(status17.NOT_FOUND, "Review not found");
  }
  const existingLike = await prisma.like.findUnique({
    where: {
      viewerId_reviewId: {
        viewerId: viewer.id,
        reviewId
      }
    }
  });
  if (existingLike) {
    await prisma.$transaction(async (tx) => {
      await tx.like.delete({
        where: {
          viewerId_reviewId: {
            viewerId: viewer.id,
            reviewId
          }
        }
      });
      await tx.review.update({
        where: { id: reviewId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      });
    });
    return { liked: false };
  }
  await prisma.$transaction(async (tx) => {
    await tx.like.create({
      data: {
        viewerId: viewer.id,
        reviewId
      }
    });
    await tx.review.update({
      where: { id: reviewId },
      data: {
        likesCount: {
          increment: 1
        }
      }
    });
  });
  return { liked: true };
};
var ReviewService = {
  createReview,
  getReviewsByContent,
  getMyReviews,
  updateReview,
  deleteReview,
  toggleLike
};

// src/app/modules/review/review.controller.ts
var createReview2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await ReviewService.createReview(payload, user);
  sendResponse(res, {
    httpStatusCode: status18.CREATED,
    success: true,
    message: "Review created successfully",
    data: result
  });
});
var getReviewsByContent2 = catchAsync(async (req, res) => {
  const contentId = req.params.contentId;
  const result = await ReviewService.getReviewsByContent(contentId);
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result
  });
});
var updateReview2 = catchAsync(async (req, res) => {
  const user = req.user;
  const reviewId = req.params.reviewId;
  const payload = req.body;
  const result = await ReviewService.updateReview(reviewId, payload, user);
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Review updated successfully",
    data: result
  });
});
var deleteReview2 = catchAsync(async (req, res) => {
  const user = req.user;
  const reviewId = req.params.reviewId;
  await ReviewService.deleteReview(reviewId, user);
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Review deleted successfully",
    data: null
  });
});
var getMyReviews2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await ReviewService.getMyReviews(user);
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result
  });
});
var toggleLike2 = catchAsync(async (req, res) => {
  const user = req.user;
  const reviewId = req.params.reviewId;
  const result = await ReviewService.toggleLike(reviewId, user);
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Like toggled successfully",
    data: result
  });
});
var ReviewController = {
  createReview: createReview2,
  getReviewsByContent: getReviewsByContent2,
  getMyReviews: getMyReviews2,
  updateReview: updateReview2,
  deleteReview: deleteReview2,
  toggleLike: toggleLike2
};

// src/app/modules/review/review.validation.ts
import z6 from "zod";
var createReviewZodSchema = z6.object({
  contentId: z6.string().min(1, "Content id is required"),
  rating: z6.number().int().min(1).max(5),
  tags: z6.array(z6.string()).default([]),
  hasSpoiler: z6.boolean().optional(),
  parentId: z6.string().optional()
});
var updateReviewZodSchema = z6.object({
  rating: z6.number().int().min(1).max(5).optional(),
  tags: z6.array(z6.string()).optional(),
  hasSpoiler: z6.boolean().optional()
});

// src/app/modules/review/review.route.ts
var router7 = Router7();
router7.get("/content/:contentId", ReviewController.getReviewsByContent);
router7.get("/my-reviews", checkAuth(Role.VIEWER), ReviewController.getMyReviews);
router7.post("/", checkAuth(Role.VIEWER), validateRequest(createReviewZodSchema), ReviewController.createReview);
router7.patch("/:reviewId", checkAuth(Role.VIEWER), validateRequest(updateReviewZodSchema), ReviewController.updateReview);
router7.delete("/:reviewId", checkAuth(Role.VIEWER), ReviewController.deleteReview);
router7.post("/:reviewId/toggle-like", checkAuth(Role.VIEWER), ReviewController.toggleLike);
var ReviewRoutes = router7;

// src/app/modules/payment/payment.route.ts
import { Router as Router8 } from "express";

// src/app/modules/payment/payment.controller.ts
import status20 from "http-status";

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/app/modules/payment/payment.service.ts
import { v4 as uuidv4 } from "uuid";
import Stripe2 from "stripe";
import status19 from "http-status";
var createCheckoutSession = async (viewerId, payload) => {
  const viewer = await prisma.viewer.findUnique({
    where: { userId: viewerId }
  });
  if (!viewer) {
    throw new AppError_default(status19.NOT_FOUND, "Viewer record not found for current user.");
  }
  if (payload.type === "TICKET") {
    return await handleTicketCheckout(viewer, payload.contentId);
  } else if (payload.type === "SUBSCRIPTION") {
    return await handleSubscriptionCheckout(viewer, payload.plan);
  }
  throw new AppError_default(status19.BAD_REQUEST, "Invalid payment type");
};
var handleTicketCheckout = async (viewer, contentId) => {
  const content = await prisma.content.findUnique({
    where: { id: contentId }
  });
  if (!content) {
    throw new AppError_default(status19.NOT_FOUND, "Content not found.");
  }
  if (!content.ticketPrice || content.ticketPrice <= 0) {
    throw new AppError_default(status19.BAD_REQUEST, "Content does not have a valid ticket price.");
  }
  if (content.accessType === AccessType.FREE || content.accessType === AccessType.SUBSCRIPTION) {
    throw new AppError_default(status19.BAD_REQUEST, "This content is not available for ticket purchase.");
  }
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      viewerId: viewer.id,
      contentId: content.id
    },
    include: {
      payment: true
    }
  });
  let ticket = existingTicket;
  if (ticket && ticket.payment && ticket.payment.status === PaymentStatus.PAID) {
    throw new AppError_default(status19.BAD_REQUEST, "Ticket already purchased for this content.");
  }
  if (!ticket) {
    ticket = await prisma.ticket.create({
      data: {
        viewer: { connect: { id: viewer.id } },
        content: { connect: { id: content.id } },
        paymentStatus: PaymentStatus.PENDING
      },
      include: {
        payment: true
      }
    });
  } else {
    ticket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { paymentStatus: PaymentStatus.PENDING },
      include: { payment: true }
    });
  }
  let payment = ticket.payment;
  if (!payment) {
    console.log(`[CHECKOUT] Creating new payment for ticket ${ticket.id}`);
    payment = await prisma.payment.create({
      data: {
        transactionId: uuidv4(),
        amount: content.ticketPrice,
        status: PaymentStatus.PENDING,
        purpose: "TICKET_PURCHASE",
        viewer: { connect: { id: viewer.id } },
        ticket: { connect: { id: ticket.id } }
      }
    });
  } else {
    if (payment.status === PaymentStatus.PENDING) {
      console.log(`[CHECKOUT] Reusing existing PENDING payment ${payment.id} for ticket ${ticket.id}`);
    } else {
      console.log(`[CHECKOUT] Resetting payment ${payment.id} status from ${payment.status} to PENDING`);
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PENDING }
      });
    }
  }
  const stripeClient = new Stripe2(envVars.STRIPE.STRIPE_SECRET_KEY);
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: content.title,
            description: content.description || void 0
          },
          unit_amount: Math.round(content.ticketPrice * 100)
        },
        quantity: 1
      }
    ],
    customer_email: viewer.email,
    metadata: {
      ticketId: ticket.id,
      paymentId: payment.id
    },
    success_url: `${envVars.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment-canceled`
  });
  return {
    url: session.url,
    sessionId: session.id,
    ticketId: ticket.id,
    paymentId: payment.id
  };
};
var handleSubscriptionCheckout = async (viewer, plan) => {
  const subscriptionPlans = {
    PREMIUM_MONTHLY: { amount: 9.99, days: 30 },
    PREMIUM_YEARLY: { amount: 99.99, days: 365 }
  };
  const planDetails = subscriptionPlans[plan];
  if (!planDetails) {
    throw new AppError_default(status19.BAD_REQUEST, "Invalid subscription plan.");
  }
  let subscription;
  let purpose;
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      viewerId: viewer.id,
      status: PaymentStatus.PAID,
      endDate: { gte: /* @__PURE__ */ new Date() }
    }
  });
  if (existingSubscription) {
    purpose = "SUBSCRIPTION_RENEWAL";
    subscription = existingSubscription;
  } else {
    purpose = "SUBSCRIPTION_PURCHASE";
    const endDate = /* @__PURE__ */ new Date();
    endDate.setDate(endDate.getDate() + planDetails.days);
    const created = await prisma.subscription.create({
      data: {
        viewerId: viewer.id,
        plan,
        amount: planDetails.amount,
        endDate,
        status: PaymentStatus.PENDING,
        autoRenew: false
      }
    });
    subscription = created;
  }
  if (!subscription) {
    throw new AppError_default(status19.INTERNAL_SERVER_ERROR, "Failed to create or retrieve subscription");
  }
  const paymentAmount = planDetails.amount;
  const existingPayment = await prisma.payment.findFirst({
    where: {
      subscriptionId: subscription.id,
      status: PaymentStatus.PENDING
    }
  });
  const payment = existingPayment || await prisma.payment.create({
    data: {
      transactionId: uuidv4(),
      amount: paymentAmount,
      status: PaymentStatus.PENDING,
      purpose,
      viewer: { connect: { id: viewer.id } },
      subscription: { connect: { id: subscription.id } },
      ticketId: null
    }
  });
  if (existingPayment) {
    console.log(`[CHECKOUT] Reusing existing PENDING payment ${payment.id} for subscription ${subscription.id}`);
  } else {
    console.log(`[CHECKOUT] Created new payment ${payment.id} for subscription ${subscription.id}`);
  }
  const stripeClient = new Stripe2(envVars.STRIPE.STRIPE_SECRET_KEY);
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan} Subscription`,
            description: `Access to CineCraze ${plan.replace("_", " ").toLowerCase()} features`
          },
          unit_amount: Math.round(planDetails.amount * 100)
        },
        quantity: 1
      }
    ],
    customer_email: viewer.email,
    metadata: {
      subscriptionId: subscription.id,
      paymentId: payment.id
    },
    success_url: `${envVars.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment-canceled`
  });
  return {
    url: session.url,
    sessionId: session.id,
    subscriptionId: subscription.id,
    paymentId: payment.id
  };
};
var handlerStripeWebhookEvent = async (event) => {
  console.log(`
${"\u2550".repeat(60)}`);
  console.log(`[WEBHOOK] \u{1F4E8} Received webhook event`);
  console.log(`[WEBHOOK] Type: ${event.type}`);
  console.log(`[WEBHOOK] ID: ${event.id}`);
  console.log(`[WEBHOOK] Created: ${new Date(event.created * 1e3).toISOString()}`);
  console.log(`${"\u2550".repeat(60)}`);
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });
  if (existingPayment) {
    console.log(`[WEBHOOK] \u23ED\uFE0F  Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const ticketId = session.metadata?.ticketId;
      const paymentId = session.metadata?.paymentId;
      const subscriptionId = session.metadata?.subscriptionId;
      if (!paymentId) {
        console.error("Missing paymentId in session metadata");
        return { message: "Missing paymentId in session metadata" };
      }
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          ticket: true,
          subscription: true,
          viewer: true
        }
      });
      if (!payment) {
        console.error(`Payment with id ${paymentId} not found`);
        return { message: `Payment with id ${paymentId} not found` };
      }
      if (payment.purpose === "TICKET_PURCHASE") {
        if (!ticketId) {
          console.error("Missing ticketId in session metadata for ticket purchase");
          return { message: "Missing ticketId in session metadata" };
        }
        console.log(`[WEBHOOK] Ticket purchase detected. ticketId=${ticketId}, paymentId=${paymentId}, session.payment_status=${session.payment_status}`);
        console.log(`[WEBHOOK] Payment record:`, {
          id: payment.id,
          purpose: payment.purpose,
          status: payment.status,
          ticketId: payment.ticketId,
          viewerId: payment.viewerId
        });
        try {
          const newStatus = session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID;
          console.log(`[WEBHOOK] Will set ticket status to: ${newStatus}`);
          await prisma.$transaction(async (tx) => {
            const ticketUpdate = await tx.ticket.update({
              where: { id: ticketId },
              data: {
                paymentStatus: newStatus
              }
            });
            console.log(`[WEBHOOK] Ticket updated successfully:`, { id: ticketUpdate.id, paymentStatus: ticketUpdate.paymentStatus });
            const paymentUpdate = await tx.payment.update({
              where: { id: paymentId },
              data: {
                stripeEventId: event.id,
                status: newStatus,
                paymentGatewayData: session
              }
            });
            console.log(`[WEBHOOK] Payment updated successfully:`, { id: paymentUpdate.id, status: paymentUpdate.status, stripeEventId: paymentUpdate.stripeEventId });
          });
          console.log(`[WEBHOOK] Transaction committed successfully`);
        } catch (txError) {
          console.error("[WEBHOOK] TRANSACTION FAILED:", {
            error: txError.message,
            code: txError.code,
            meta: txError.meta,
            stack: txError.stack
          });
          throw txError;
        }
        console.log(`[WEBHOOK] \u2713 Processed ticket payment for ticket ${ticketId} and payment ${paymentId}`);
      } else if (payment.purpose === "SUBSCRIPTION_PURCHASE" || payment.purpose === "SUBSCRIPTION_RENEWAL") {
        if (!subscriptionId) {
          console.error("[WEBHOOK] \u274C Missing subscriptionId in session metadata for subscription");
          return { message: "Missing subscriptionId in session metadata" };
        }
        console.log(`[WEBHOOK] \u{1F504} SUBSCRIPTION ${payment.purpose} - Processing subscription payment...`);
        console.log(`  Subscription ID: ${subscriptionId}`);
        const subscriptionPlanMap = {
          PREMIUM_MONTHLY: 30,
          PREMIUM_YEARLY: 365
        };
        const newStatus = session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID;
        console.log(`[WEBHOOK] \u{1F504} Updating status from ${payment.status} to ${newStatus}`);
        await prisma.$transaction(async (tx) => {
          if (payment.purpose === "SUBSCRIPTION_RENEWAL" && newStatus === PaymentStatus.PAID) {
            console.log(`[WEBHOOK] \u{1F504} Processing subscription renewal...`);
            const existingSubscription = await tx.subscription.findUnique({
              where: { id: subscriptionId }
            });
            if (existingSubscription) {
              const daysToAdd = subscriptionPlanMap[existingSubscription.plan] || 30;
              const newEndDate = new Date(existingSubscription.endDate);
              newEndDate.setDate(newEndDate.getDate() + daysToAdd);
              await tx.subscription.update({
                where: { id: subscriptionId },
                data: {
                  status: PaymentStatus.PAID,
                  endDate: newEndDate
                }
              });
              await tx.viewer.update({
                where: { id: payment.viewerId },
                data: {
                  subscriptionEnds: newEndDate
                }
              });
              console.log(`[WEBHOOK] \u2705 Subscription renewed: { endDate: ${newEndDate.toISOString()}, daysAdded: ${daysToAdd} }`);
            }
          } else {
            console.log(`[WEBHOOK] \u{1F504} Updating subscription status to ${newStatus}...`);
            await tx.subscription.update({
              where: { id: subscriptionId },
              data: {
                status: newStatus
              }
            });
            if (newStatus === PaymentStatus.PAID && payment.viewer) {
              const subscription = await tx.subscription.findUnique({
                where: { id: subscriptionId }
              });
              if (subscription) {
                await tx.viewer.update({
                  where: { id: payment.viewerId },
                  data: {
                    subscriptionPlan: subscription.plan,
                    subscriptionEnds: subscription.endDate
                  }
                });
                console.log(`[WEBHOOK] \u2705 Viewer subscription updated: { plan: ${subscription.plan}, ends: ${subscription.endDate.toISOString()} }`);
              }
            }
          }
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              stripeEventId: event.id,
              status: newStatus,
              paymentGatewayData: session
            }
          });
        });
        console.log(`[WEBHOOK] \u2705 Subscription payment processed: subscription ${subscriptionId}, status ${newStatus}`);
      } else {
        console.log(`[WEBHOOK] \u26A0\uFE0F  Unknown payment purpose: ${payment.purpose}. Updating payment status only...`);
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session
          }
        });
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      console.log(`[WEBHOOK] \u23F1\uFE0F  CHECKOUT SESSION EXPIRED`);
      console.log(`  Session ID: ${session.id}`);
      console.log(`  Payment ID: ${paymentId}`);
      if (paymentId) {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: { subscription: true }
        });
        if (payment) {
          console.log(`[WEBHOOK] \u{1F504} Marking payment as FAILED...`);
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: PaymentStatus.FAILED,
                paymentGatewayData: session
              }
            });
            if (payment.purpose === "SUBSCRIPTION_PURCHASE" && payment.subscription) {
              await tx.subscription.update({
                where: { id: payment.subscriptionId },
                data: { status: PaymentStatus.FAILED }
              });
              console.log(`[WEBHOOK] \u2705 Subscription marked as FAILED: ${payment.subscriptionId}`);
            }
          });
          console.log(`[WEBHOOK] \u2705 Payment marked as FAILED: ${paymentId}`);
        } else {
          console.warn(`[WEBHOOK] \u26A0\uFE0F  Payment not found for ID: ${paymentId}`);
        }
      } else {
        console.warn(`[WEBHOOK] \u26A0\uFE0F  No paymentId in session metadata`);
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentId = paymentIntent.metadata?.paymentId;
      console.log(`[WEBHOOK] \u274C PAYMENT INTENT FAILED`);
      console.log(`  Payment Intent ID: ${paymentIntent.id}`);
      console.log(`  Payment ID: ${paymentId}`);
      console.log(`  Reason: ${paymentIntent.last_payment_error?.message}`);
      if (paymentId) {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: { subscription: true }
        });
        if (payment) {
          console.log(`[WEBHOOK] \u{1F504} Marking payment as FAILED...`);
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: PaymentStatus.FAILED,
                paymentGatewayData: paymentIntent
              }
            });
            if (payment.purpose === "SUBSCRIPTION_PURCHASE" && payment.subscription) {
              await tx.subscription.update({
                where: { id: payment.subscriptionId },
                data: { status: PaymentStatus.FAILED }
              });
              console.log(`[WEBHOOK] \u2705 Subscription marked as FAILED: ${payment.subscriptionId}`);
            }
          });
          console.log(`[WEBHOOK] \u2705 Payment marked as FAILED: ${paymentId}`);
        } else {
          console.warn(`[WEBHOOK] \u26A0\uFE0F  Payment not found for ID: ${paymentId}`);
        }
      } else {
        console.warn(`[WEBHOOK] \u26A0\uFE0F  No paymentId in payment intent metadata`);
      }
      break;
    }
    default:
      console.log(`[WEBHOOK] \u26A0\uFE0F  Unhandled event type: ${event.type}`);
  }
  return { message: `Webhook Event ${event.id} processed successfully` };
};
var PaymentService = {
  handlerStripeWebhookEvent,
  createCheckoutSession
};

// src/app/modules/payment/payment.controller.ts
var handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  console.log("[WEBHOOK] \u{1F514} WEBHOOK REQUEST RECEIVED");
  console.log("[WEBHOOK] Signature present:", !!signature);
  console.log("[WEBHOOK] Webhook secret configured:", !!webhookSecret);
  console.log("[WEBHOOK] Raw body type:", typeof req.body);
  console.log("[WEBHOOK] Raw body length:", req.body?.length || Buffer.byteLength(req.body) || 0);
  console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  if (!signature || !webhookSecret) {
    console.error("[WEBHOOK] \u274C Missing Stripe signature or webhook secret");
    return res.status(status20.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    console.log("[WEBHOOK] \u2705 Event constructed successfully");
    console.log("[WEBHOOK] Event type:", event.type);
    console.log("[WEBHOOK] Event ID:", event.id);
  } catch (error) {
    console.error("[WEBHOOK] \u274C Error verifying signature:", error.message);
    console.error("[WEBHOOK] Error code:", error.code);
    console.error("[WEBHOOK] Error type:", error.type);
    return res.status(status20.BAD_REQUEST).json({ message: "Error processing Stripe webhook" });
  }
  try {
    console.log("[WEBHOOK] \u{1F504} Passing to PaymentService.handlerStripeWebhookEvent...");
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    console.log("[WEBHOOK] \u2705 Service handler completed successfully");
    console.log("[WEBHOOK] Result:", result);
    sendResponse(res, {
      httpStatusCode: status20.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  } catch (error) {
    console.error("[WEBHOOK] \u274C Error in service handler");
    console.error("[WEBHOOK] Error message:", error.message);
    console.error("[WEBHOOK] Error stack:", error.stack);
    sendResponse(res, {
      httpStatusCode: status20.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error handling Stripe webhook event"
    });
  }
});
var createCheckoutSession2 = catchAsync(async (req, res) => {
  const { type, contentId, plan } = req.body;
  const user = req.user;
  const session = await PaymentService.createCheckoutSession(user.userId, { type, contentId, plan });
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Stripe checkout session created successfully",
    data: session
  });
});
var PaymentController = {
  handleStripeWebhookEvent,
  createCheckoutSession: createCheckoutSession2
};

// src/app/modules/payment/payment.validation.ts
import z7 from "zod";
var createCheckoutSessionZodSchema = z7.object({
  type: z7.enum(["TICKET", "SUBSCRIPTION"]),
  contentId: z7.string().uuid({ message: "Valid contentId is required" }).optional(),
  plan: z7.enum(["PREMIUM_MONTHLY", "PREMIUM_YEARLY"]).optional()
}).refine((data) => {
  if (data.type === "TICKET" && !data.contentId) {
    return false;
  }
  if (data.type === "SUBSCRIPTION" && !data.plan) {
    return false;
  }
  return true;
}, {
  message: "Invalid payload: TICKET requires contentId, SUBSCRIPTION requires plan"
});

// src/app/modules/payment/payment.route.ts
var router8 = Router8();
router8.post(
  "/checkout",
  checkAuth(Role.VIEWER),
  validateRequest(createCheckoutSessionZodSchema),
  PaymentController.createCheckoutSession
);
var PaymentRoutes = router8;

// src/app/modules/subscription/subscription.route.ts
import { Router as Router9 } from "express";

// src/app/modules/subscription/subscription.controller.ts
import status22 from "http-status";

// src/app/modules/subscription/subscription.service.ts
import status21 from "http-status";
var getViewerOrThrow3 = async (user) => {
  const viewer = await prisma.viewer.findUnique({
    where: { userId: user.userId }
  });
  if (!viewer) {
    throw new AppError_default(status21.FORBIDDEN, "Viewer not found");
  }
  return viewer;
};
var getMySubscriptions = async (user) => {
  const viewer = await getViewerOrThrow3(user);
  const subscriptions = await prisma.subscription.findMany({
    where: { viewerId: viewer.id },
    include: { payments: true },
    orderBy: { createdAt: "desc" }
  });
  return subscriptions;
};
var createSubscription = async (payload, user) => {
  const viewer = await getViewerOrThrow3(user);
  const end = payload.endDate ? new Date(payload.endDate) : new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30);
  const subscription = await prisma.subscription.create({
    data: {
      plan: payload.plan,
      amount: payload.amount ?? 0,
      endDate: end,
      viewerId: viewer.id
    }
  });
  return subscription;
};
var cancelSubscription = async (subscriptionId, user) => {
  const viewer = await getViewerOrThrow3(user);
  const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!subscription || subscription.viewerId !== viewer.id) {
    throw new AppError_default(status21.NOT_FOUND, "Subscription not found");
  }
  await prisma.subscription.update({ where: { id: subscriptionId }, data: { status: "FAILED" } });
  return null;
};
var SubscriptionService = {
  getMySubscriptions,
  createSubscription,
  cancelSubscription
};

// src/app/modules/subscription/subscription.controller.ts
var getMySubscriptions2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await SubscriptionService.getMySubscriptions(user);
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Subscriptions fetched successfully",
    data: result
  });
});
var createSubscription2 = catchAsync(async (req, res) => {
  const user = req.user;
  const { plan, amount, endDate } = req.body;
  const result = await SubscriptionService.createSubscription({ plan, amount, endDate }, user);
  sendResponse(res, {
    httpStatusCode: status22.CREATED,
    success: true,
    message: "Subscription created successfully",
    data: result
  });
});
var cancelSubscription2 = catchAsync(async (req, res) => {
  const user = req.user;
  const subscriptionId = req.params.subscriptionId;
  await SubscriptionService.cancelSubscription(subscriptionId, user);
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Subscription cancelled successfully",
    data: null
  });
});
var getSubscriptionPlans = catchAsync(async (req, res) => {
  const plans = [
    {
      id: "PREMIUM_MONTHLY",
      name: "Premium Monthly",
      price: 9.99,
      billingCycle: "monthly",
      description: "Unlimited streaming and premium features",
      features: [
        "Unlimited access to all movies and TV shows",
        "Ad-free experience",
        "4K streaming quality",
        "Offline downloads",
        "Multiple device support"
      ]
    },
    {
      id: "PREMIUM_YEARLY",
      name: "Premium Yearly",
      price: 99.99,
      billingCycle: "yearly",
      description: "Best value - save 17% compared to monthly",
      features: [
        "All monthly features included",
        "Support for up to 4 devices simultaneously",
        "Exclusive early access to new releases",
        "Priority customer support",
        "Family sharing options"
      ]
    }
  ];
  sendResponse(res, {
    httpStatusCode: status22.OK,
    success: true,
    message: "Subscription plans fetched successfully",
    data: plans
  });
});
var SubscriptionController = {
  getMySubscriptions: getMySubscriptions2,
  createSubscription: createSubscription2,
  cancelSubscription: cancelSubscription2,
  getSubscriptionPlans
};

// src/app/modules/subscription/subscription.route.ts
var router9 = Router9();
router9.get("/my-subscriptions", checkAuth(Role.VIEWER), SubscriptionController.getMySubscriptions);
router9.get("/plans", SubscriptionController.getSubscriptionPlans);
router9.post("/", checkAuth(Role.VIEWER), SubscriptionController.createSubscription);
router9.patch("/:subscriptionId/cancel", checkAuth(Role.VIEWER), SubscriptionController.cancelSubscription);
var SubscriptionRoutes = router9;

// src/app/modules/ticket/ticket.route.ts
import { Router as Router10 } from "express";

// src/app/modules/ticket/ticket.controller.ts
import status24 from "http-status";

// src/app/modules/ticket/ticket.service.ts
import status23 from "http-status";
var getViewerOrThrow4 = async (user) => {
  const viewer = await prisma.viewer.findUnique({
    where: { userId: user.userId }
  });
  if (!viewer) {
    throw new AppError_default(status23.FORBIDDEN, "Viewer not found");
  }
  return viewer;
};
var getMyTickets = async (user) => {
  const viewer = await getViewerOrThrow4(user);
  const tickets = await prisma.ticket.findMany({
    where: { viewerId: viewer.id },
    include: { content: true, payment: true },
    orderBy: { purchasedAt: "desc" }
  });
  return tickets;
};
var purchaseTicket = async (payload, user) => {
  const viewer = await getViewerOrThrow4(user);
  const content = await prisma.content.findUnique({ where: { id: payload.contentId } });
  if (!content) {
    throw new AppError_default(status23.NOT_FOUND, "Content not found");
  }
  const existing = await prisma.ticket.findUnique({
    where: { viewerId_contentId: { viewerId: viewer.id, contentId: payload.contentId } }
  });
  if (existing) {
    throw new AppError_default(status23.CONFLICT, "Ticket already purchased for this content");
  }
  const ticket = await prisma.ticket.create({
    data: {
      viewerId: viewer.id,
      contentId: payload.contentId,
      paymentStatus: "UNPAID"
    },
    include: { content: true }
  });
  return ticket;
};
var TicketService = {
  getMyTickets,
  purchaseTicket
};

// src/app/modules/ticket/ticket.controller.ts
var getMyTickets2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await TicketService.getMyTickets(user);
  sendResponse(res, {
    httpStatusCode: status24.OK,
    success: true,
    message: "Tickets fetched successfully",
    data: result
  });
});
var purchaseTicket2 = catchAsync(async (req, res) => {
  const user = req.user;
  const { contentId } = req.body;
  const result = await TicketService.purchaseTicket({ contentId }, user);
  sendResponse(res, {
    httpStatusCode: status24.CREATED,
    success: true,
    message: "Ticket purchased successfully",
    data: result
  });
});
var TicketController = {
  getMyTickets: getMyTickets2,
  purchaseTicket: purchaseTicket2
};

// src/app/modules/ticket/ticket.route.ts
var router10 = Router10();
router10.get("/my-tickets", checkAuth(Role.VIEWER), TicketController.getMyTickets);
router10.post("/", checkAuth(Role.VIEWER), TicketController.purchaseTicket);
var TicketRoutes = router10;

// src/app/shared/routes/index.ts
var router11 = Router11();
router11.use("/auth", AuthRoutes);
router11.use("/users", UserRoutes);
router11.use("/admins", AdminRoutes);
router11.use("/contents", ContentRoutes);
router11.use("/content-managers", ContentManagerRoutes);
router11.use("/watchlist", WatchlistRoutes);
router11.use("/reviews", ReviewRoutes);
router11.use("/payments", PaymentRoutes);
router11.use("/subscriptions", SubscriptionRoutes);
router11.use("/tickets", TicketRoutes);
var IndexRoutes = router11;

// src/app/middleware/globalErrorHandler.ts
import status26 from "http-status";
import z8 from "zod";

// src/app/errorHelpers/handleZodError.ts
import status25 from "http-status";
var handleZodError = (err) => {
  const statusCode = status25.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  if (req.file) {
    await deleteFileFromCloudinary(req.file.path);
  }
  if (req.file && Array.isArray(req.file) && req.file.length > 0) {
    const imageUrls = req.file.map((file) => file.path);
    await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  }
  let errorSources = [];
  let statusCode = status26.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof z8.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status26.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/middleware/notFound.ts
import status27 from "http-status";
var notFound = (req, res) => {
  res.status(status27.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import path2 from "path";
import qs from "qs";

// src/app/lib/paymentCleanup.ts
var cancelUnpaidSubscriptions = async () => {
  try {
    const now = /* @__PURE__ */ new Date();
    const result = await prisma.subscription.updateMany({
      where: {
        status: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PENDING]
        },
        endDate: {
          lte: now
        }
      },
      data: {
        status: PaymentStatus.FAILED
      }
    });
    console.log(`Successfully canceled ${result.count} unpaid subscriptions`);
    return result.count;
  } catch (error) {
    console.error("Error canceling unpaid subscriptions:", error);
    return 0;
  }
};
var cancelUnpaidTickets = async () => {
  try {
    const expirationThreshold = new Date(Date.now() - 1e3 * 60 * 60);
    const result = await prisma.ticket.deleteMany({
      where: {
        paymentStatus: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PENDING]
        },
        purchasedAt: {
          lte: expirationThreshold
        }
      }
    });
    console.log(`Successfully deleted ${result.count} unpaid tickets`);
    return result.count;
  } catch (error) {
    console.error("Error deleting unpaid tickets:", error);
    return 0;
  }
};
var SubscriptionService2 = {
  cancelUnpaidSubscriptions
};
var TicketService2 = {
  cancelUnpaidTickets
};

// src/app.ts
import cron from "node-cron";
var app = express();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path2.resolve(process.cwd(), `src/app/templates`));
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);
var allowedOrigins = [
  envVars.FRONTEND_URL,
  envVars.BETTER_AUTH_URL,
  process.env.PROD_APP_URL,
  "http://localhost:3000",
  "https://cine-craze-api.vercel.app"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use("/api/auth", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid Subscription Or Tickets ...");
    await SubscriptionService2.cancelUnpaidSubscriptions();
    await TicketService2.cancelUnpaidTickets();
  } catch (error) {
    console.error("Error occurred while canceling unpaid subscriptions or tickets:", error.message);
  }
});
app.use("/api/v1", IndexRoutes);
app.get("/", async (req, res) => {
  res.status(201).json({
    success: true,
    message: "API is working"
  });
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
