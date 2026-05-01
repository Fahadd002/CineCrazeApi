/**
 * Standard Token Expiration Times
 * All times are defined in seconds for JWT and milliseconds for cookies
 */

// JWT Expiration Times (in seconds)
export const TOKEN_EXPIRATION = {
    // OTP expires in 2 minutes
    OTP: 2 * 60, // 120 seconds
    
    // Access token expires in 15 minutes
    ACCESS_TOKEN: 15 * 60, // 900 seconds
    
    // Refresh token expires in 7 days
    REFRESH_TOKEN: 7 * 24 * 60 * 60, // 604800 seconds
    
    // Session token expires in 24 hours
    SESSION_TOKEN: 24 * 60 * 60, // 86400 seconds
} as const;

// Cookie Max Age (in milliseconds)
export const COOKIE_MAX_AGE = {
    // Access token cookie: 15 minutes
    ACCESS_TOKEN: TOKEN_EXPIRATION.ACCESS_TOKEN * 1000, // 900000 ms
    
    // Refresh token cookie: 7 days
    REFRESH_TOKEN: TOKEN_EXPIRATION.REFRESH_TOKEN * 1000, // 604800000 ms
    
    // Session token cookie: 24 hours
    SESSION_TOKEN: TOKEN_EXPIRATION.SESSION_TOKEN * 1000, // 86400000 ms
} as const;
