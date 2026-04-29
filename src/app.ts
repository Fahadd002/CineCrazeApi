/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/shared/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import qs from "qs";
import { envVars } from "./app/config/env";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { SubscriptionService, TicketService } from "./app/lib/paymentCleanup";
import cron from "node-cron";
const app: Application = express();
app.set("query parser", (str : string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`))

// CRITICAL: Webhook route must be BEFORE any JSON middleware
// Stripe needs the raw body for signature verification
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
  envVars.FRONTEND_URL,
  envVars.BETTER_AUTH_URL,
  process.env.PROD_APP_URL,
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);


app.use("/api/auth", toNodeHandler(auth))  

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware to parse JSON bodies
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

cron.schedule("*/25 * * * *", async () => {
    try {
        console.log("Running cron job to cancel unpaid Subscription Or Tickets ...");
        await SubscriptionService.cancelUnpaidSubscriptions();
        await TicketService.cancelUnpaidTickets();
    } catch (error : any) {
        console.error("Error occurred while canceling unpaid subscriptions or tickets:", error.message);    
    }
})

app.use("/api/v1", IndexRoutes);

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: 'API is working',
    })
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;