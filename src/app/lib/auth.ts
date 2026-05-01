import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { envVars } from "../config/env";

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
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
                }
            }
        }
    },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
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
                                otp: otp
                            }
                        });
                    }
                }
                else if (type === "forget-password") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email,
                        }
                    })

                    if (user) {
                        sendEmail({
                            to: email,
                            subject: "Password Reset OTP",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp,
                            }
                        })
                    }
                }
            },
            expiresIn: 2 * 60, // 2 minutes (120 seconds)
            otpLength: 6,
        })
    ],

    session: {
        expiresIn: 24 * 60 * 60, // 24 hours (86400 seconds)
        updateAge: 24 * 60 * 60, // 24 hours (86400 seconds)
        cookieCache: {
            enabled: true,
            maxAge: 24 * 60 * 60, // 24 hours (86400 seconds)
        }
    },
    
    redirectURLs: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },

    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],

    advanced: {
        cookiePrefix: "better-auth",
        useSecureCookies: envVars.NODE_ENV === "production",
        disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
        cookies: {
            state: {
                attributes: {
                    sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
                    secure: envVars.NODE_ENV === "production",
                    httpOnly: true,
                    path: "/",
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
                    secure: envVars.NODE_ENV === "production",
                    httpOnly: true,
                    path: "/",
                }
            }
        }
    }

});