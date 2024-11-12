import httpStatus from "http-status";
import { transporter } from "../../configs";
import { ApiError, emailProps } from "../../utils";
import { renderTemplate } from "../handlebar/handlebar.service";
import { errorLogger } from "../logger/logger.service";
import { sendEmail } from "./email.service";

// Mock dependencies
jest.mock("../../configs", () => ({
  transporter: {
    verify: jest.fn(),
    sendMail: jest.fn(),
  },
}));

jest.mock("../handlebar/handlebar.service", () => ({
  renderTemplate: jest.fn(),
}));

jest.mock("../logger/logger.service", () => ({
  errorLogger: {
    error: jest.fn(),
  },
  infoLogger: {
    info: jest.fn(),
  },
}));

describe("sendEmail", () => {
  const mockEmailData = {
    email: "abdudevs@gmail.com",
    subject: emailProps.subject.WELCOME_ADMIN,
    template: emailProps.template.WELCOME_ADMIN,
    data: { name: "testJest" },
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  //TODO: Fix the test case
  // it("should send an email successfully", async () => {
  //   // Arrange
  //   (transporter.verify as jest.Mock).mockResolvedValueOnce(undefined);
  //   (renderTemplate as jest.Mock).mockReturnValueOnce("<p>Test Email</p>");
  //   (transporter.sendMail as jest.Mock).mockResolvedValueOnce({
  //     accepted: [mockEmailData.email],
  //     rejected: [],
  //   });

  //   try {
  //     // Act
  //     const response = await sendEmail(mockEmailData);
  //     console.log("Email response:", response); // Log the response to see its structure

  //     // Assert
  //     expect(infoLogger.info).toHaveBeenCalledWith(
  //       "Server is ready to take our messages"
  //     );
  //     expect(renderTemplate).toHaveBeenCalledWith(
  //       mockEmailData.template,
  //       mockEmailData.data
  //     );

  //     expect(transporter.sendMail).toHaveBeenCalledWith({
  //       from: environment.email.NODEMAILER_EMAIL_ADDRESS,
  //       to: mockEmailData.email,
  //       subject: mockEmailData.subject,
  //       html: "<p>Test Email</p>",
  //     });
  //     expect(response.accepted).toContain(mockEmailData.email); // Simplified assertion
  //   } catch (error) {
  //     console.error("Test failed due to error:", error); // Log any errors for troubleshooting
  //     throw error; // Rethrow to ensure the test still fails
  //   }
  // });

  it("should throw an ApiError when sending email fails", async () => {
    // Arrange
    (transporter.verify as jest.Mock).mockResolvedValueOnce(undefined);
    (renderTemplate as jest.Mock).mockReturnValueOnce("<p>Test Email</p>");
    (transporter.sendMail as jest.Mock).mockRejectedValueOnce(
      new Error("Send mail error")
    );

    // Act & Assert
    await expect(sendEmail(mockEmailData)).rejects.toThrow(ApiError);
    await expect(sendEmail(mockEmailData)).rejects.toHaveProperty(
      "statusCode",
      httpStatus.INTERNAL_SERVER_ERROR // Keeping this as INTERNAL_SERVER_ERROR
    );
    await expect(sendEmail(mockEmailData)).rejects.toHaveProperty(
      "message",
      "Failed to send email to user."
    );

    expect(errorLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error on mail server:")
    );
  });

  it("should throw an ApiError if required fields are missing", async () => {
    // Arrange
    const incompleteEmailData = { ...mockEmailData, email: "" };

    // Act & Assert
    await expect(sendEmail(incompleteEmailData)).rejects.toThrow(ApiError);
    await expect(sendEmail(incompleteEmailData)).rejects.toHaveProperty(
      "statusCode",
      httpStatus.BAD_REQUEST
    );
    await expect(sendEmail(incompleteEmailData)).rejects.toHaveProperty(
      "message",
      "Missing required field: email."
    );
  });
});
