// src/dtos/admin/admin.dto.ts
import { IAdmin } from "../../interfaces";
import { getFileUrl } from "../../utils";

// Base Admin DTO with minimal properties
class AdminDtoBase {
  _id: string;
  fullName: string;
  email: string;
  profileImage: string;
  role: string;
  isEmailVerified: boolean;

  constructor(
    admin: Pick<
      IAdmin,
      "_id" | "fullName" | "email" | "profileImage" | "role" | "isEmailVerified"
    >
  ) {
    this._id = admin._id;
    this.fullName = admin.fullName;
    this.email = admin.email;
    this.profileImage = getFileUrl(admin.profileImage);
    this.role = admin.role;
    this.isEmailVerified = admin.isEmailVerified;
  }
}

// Extended Admin DTO with additional properties
export class AdminResponseDto extends AdminDtoBase {
  constructor(admin: IAdmin) {
    super(admin);
  }
}
