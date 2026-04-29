/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    }
});

interface SendEmailOptions<T extends Record<string, any> = Record<string, any>> {
    to: string;
    subject: string;
    templateName: string;
    templateData: T;
    attachments?: {
        filename: string;
        content: Buffer;
        contentType?: string;
    }[];
}

type EmailTemplate<T = any> = (data: T) => string;

const emailTemplates: Record<string, EmailTemplate> = {
    otp: (data: { name: string; otp: string }) => `
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
      © ${new Date().getFullYear()} CineCraze. All rights reserved.
    </p>

  </div>
</div>`
};

export const sendEmail = async <T extends Record<string, any>>({ subject, templateName, templateData, to, attachments }: SendEmailOptions<T>) => {
    try {
        const template = emailTemplates[templateName] as EmailTemplate<T> | undefined;
        if (!template) {
            throw new AppError(status.BAD_REQUEST, `Email template '${templateName}' not found`);
        }

        const html = template(templateData as T);

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType
            }))
        });

        console.log(`Email sent to ${to}: ${info.messageId}`);
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to send email: ${error.message}`);
    }
};
