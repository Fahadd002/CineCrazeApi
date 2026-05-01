import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import { COOKIE_MAX_AGE } from "../config/tokenConstants";

const isProduction = envVars.NODE_ENV === "production";
const baseCookieOptions = {
    httpOnly: true,
    path: "/",
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
} as const;


const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions);
    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);
    return refreshToken;
}

const setAccessTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, 'accessToken', token, {
        ...baseCookieOptions,
        // 15 minutes
        maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, 'refreshToken', token, {
        ...baseCookieOptions,
        // 7 days
        maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, 'better-auth.session_token', token, {
        ...baseCookieOptions,
        // 24 hours
        maxAge: COOKIE_MAX_AGE.SESSION_TOKEN,
    });
}

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie,
    baseCookieOptions,
}