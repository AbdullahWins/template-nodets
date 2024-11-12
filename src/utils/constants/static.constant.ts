// src/utils/constants/static.constant.ts
export const staticProps = {
  default: {
    DEFAULT_IMAGE_PATH: "public/default/default.png",
    DEFAULT_DOCUMENT_PATH: "public/default/default.png",
  },

  common: {
    SOMETHING_WENT_WRONG: "Something went wrong!",
    NOT_FOUND: "Not found!",

    FILE_NOT_FOUND: "File not found!",
    FILE_RETRIEVED: "File retrieved successfully!",

    ALREADY_EXISTS: "Already exists!",

    CREATED: "Created successfully!",
    RETRIEVED: "Retrieved successfully!",
    UPDATED: "Updated successfully!",
    DELETED: "Deleted successfully!",

    PASSWORD_UPDATED: "Admin password updated successfully!",
    PASSWORD_RESET: "Admin password reset successfully!",
    LOGGED_IN: "Admin logged in successfully!",
    LOGGED_OUT: "Admin logged out successfully!",

    INVALID_ID: "Invalid ID format!",
    INVALID_CREDENTIALS: "Invalid credentials!",
    INVALID_PASSWORD: "Invalid password!",

    FORBIDDEN: "Forbidden!",
    UNAUTHORIZED: "Unauthorized!",
    DATA_REQUIRED: "Data is required!",
    MISSING_REQUIRED_FIELDS: "Missing required fields!",

    MULTER_ERROR: "Multer error occured!",
    VALIDATION_ERROR: "Validation error!",
    INTERNAL_SERVER_ERROR: "Internal server error!",
  },

  otp: {
    OTP_SENT: "OTP sent successfully!",
    OTP_VERIFIED: "OTP verified successfully!",
    OTP_INVALID: "Invalid OTP!",
    OTP_EXPIRED: "OTP expired!",
  },

  jwt: {
    INVALID_TOKEN: "Invalid token!",
    TOKEN_EXPIRED: "Token has expired!",
    TOKEN_NOT_ACTIVE: "Token not active!",
    TOKEN_VERIFIED: "Token verified successfully!",
    TOKEN_GENERATED: "Token generated successfully!",
    TOKEN_REFRESHED: "Token refreshed successfully!",
    TOKEN_REVOKED: "Token revoked successfully!",
    TOKEN_NOT_FOUND: "Token not found!",
  },

  cast: {
    INVALID_ID: "Passed id is invalid!",
    CAST_ERROR: "Cast Error occured!",
  },

  email: {
    EMAIL_SERVER_READY: "Mail server is ready to take our messages",
    TEMPLATE_RENDER_ERROR: "Failed to render email template!",
    TEMPLATE_MISSING: "Missing required field: template.",
    SUBJECT_MISSING: "Missing required field: subject.",
    EMAIL_MISSING: "Missing required field: email.",
    EMAIL_NOT_SENT: "Failed to send email to user.",
  },
};
