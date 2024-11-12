// src/services/email/email.service.ts
import httpStatus from "http-status";
import { environment, transporter } from "../../configs";
import { ApiError, staticProps } from "../../utils";
import { renderTemplate } from "../handlebar/handlebar.service";
import { errorLogger, infoLogger } from "../logger/logger.service";
import { ISendEmail } from "../../interfaces";

// Function to handle send email errors
const handleSendEmailError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : "unknown";
  errorLogger.error(`Error on mail server: ${errorMessage}`);
  throw new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    staticProps.email.EMAIL_NOT_SENT
  );
};

const validateEmailInput = ({ email, subject, template }: ISendEmail) => {
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, staticProps.email.EMAIL_MISSING);
  }
  if (!subject) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      staticProps.email.SUBJECT_MISSING
    );
  }
  if (!template) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      staticProps.email.TEMPLATE_MISSING
    );
  }
};

const sendMail = async (
  email: string,
  subject: string,
  htmlContent: string
) => {
  const response = await transporter.sendMail({
    from: environment.email.NODEMAILER_EMAIL_ADDRESS,
    to: email,
    subject: subject,
    html: htmlContent,
  });
  return response;
};

export const sendEmail = async ({
  email,
  subject,
  template,
  data,
}: ISendEmail) => {
  validateEmailInput({ email, subject, template, data });

  try {
    await transporter.verify();
    infoLogger.info(staticProps.email.EMAIL_SERVER_READY);
    const htmlContent = renderTemplate(template, data);

    if (!htmlContent) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        staticProps.email.TEMPLATE_RENDER_ERROR
      );
    }

    return await sendMail(email, subject, htmlContent);
  } catch (error) {
    return handleSendEmailError(error);
  }
};
