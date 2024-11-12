import { httpLogger } from "../../services/logger/logger.service";
import { Request, Response } from "express";
import { getRequestFulllUrl } from "../../utils";
import { requestLoggerMiddleware } from "./logger.middleware";

jest.mock("../services/logger/logger.service");
jest.mock("../utils", () => ({
  getRequestFulllUrl: jest.fn(() => "http://localhost:3000/test"),
}));

describe("requestLoggerMiddleware", () => {
  let req: Partial<Request>;
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    // Enable Jest timer mocks
    jest.useFakeTimers();

    req = { method: "GET" } as Partial<Request>;
    res = {
      on: jest.fn((event: string, callback: () => void) => {
        if (event === "finish") callback(); // Simulate response finishing
      }),
      statusCode: 200,
    } as unknown as Response; // Cast to Response
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
    jest.useRealTimers(); // Restore real timers
  });

  it("logs the request details when the response finishes", () => {
    const startTime = Date.now(); // Capture the start time
    jest.spyOn(Date, "now").mockImplementation(() => startTime);

    requestLoggerMiddleware(req as Request, res, next);
    expect(next).toHaveBeenCalled(); // Check that next() was called

    // Manually trigger the finish event to log the message
    res.on("finish", () => {});

    // Now verify if the logger was called with the expected message
    const expectedMessage = `GET http://localhost:3000/test 200 - 0ms`;
    expect(httpLogger.http).toHaveBeenCalledWith(expectedMessage);
  });

  it("logs the correct URL using getRequestFulllUrl utility", () => {
    requestLoggerMiddleware(req as Request, res, next);
    expect(getRequestFulllUrl).toHaveBeenCalledWith(req);
  });
});
