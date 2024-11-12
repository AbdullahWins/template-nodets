import { generateJwtToken, verifyJwtToken } from "./jwt.service"; // Adjust the import path as necessary
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { IUser } from "../../interfaces";
import { environment } from "../../configs";

// Mock the jsonwebtoken module
jest.mock("jsonwebtoken");

describe("JWT Service", () => {
  const mockUser: Partial<IUser> = { _id: "12345" };
  const mockToken = "mockedToken";
  const mockSecret: Secret = "testSecret"; // Example secret
  const mockPayload: JwtPayload = { _id: "12345" };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe("generateJwtToken", () => {
    it("should generate a JWT token", () => {
      // Mock the jwt.sign function
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = generateJwtToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { _id: mockUser._id },
        environment.jwt.JWT_ACCESS_TOKEN_SECRET,
        {
          expiresIn: environment.jwt.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe("verifyJwtToken", () => {
    it("should verify a JWT token and return the payload", () => {
      // Mock the jwt.verify function
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const payload = verifyJwtToken(mockToken, mockSecret);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(payload).toEqual(mockPayload);
    });

    it("should throw an error if verification fails", () => {
      // Mock the jwt.verify function to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyJwtToken(mockToken, mockSecret)).toThrow(
        "Invalid token"
      );
    });
  });
});
