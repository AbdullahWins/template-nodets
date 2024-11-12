// src/dtos/user/user.dto.ts
import { IUser } from "../../interfaces";
import { getFileUrl } from "../../utils";

// Base User DTO
class UserDtoBase {
  _id: string;
  email: string;
  fullName: string;
  profileImage: string;

  constructor(
    user: Pick<IUser, "_id" | "email" | "fullName" | "profileImage">
  ) {
    this._id = user._id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.profileImage = getFileUrl(user.profileImage);
  }
}

// DTO for user login response (id, email, fullName and profileImage only)
export class UserLoginDto extends UserDtoBase {
  constructor(user: IUser) {
    super(user);
  }
}

// Full User DTO for regular responses
export class UserResponseDto extends UserDtoBase {
  username: string;
  phone: string;
  isEmailVerified: boolean;

  constructor(user: IUser) {
    super(user);
    this.username = user.username;
    this.phone = user.phone;
    this.isEmailVerified = user.isEmailVerified;
  }
}
