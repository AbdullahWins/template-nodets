// src/utils/constants/auth.constant.ts
export const AdminRoles = {
  SUB_ADMIN: "sub-admin",
  NORMAL_ADMIN: "normal-admin",
  SUPER_ADMIN: "super-admin",
} as const;

export const StoreRoles = {
  STORE_ADMIN: "store-admin",
  STORE_MANAGER: "store-manager",
  STORE_STAFF: "store-staff",
} as const;

export const UserRoles = {
  USER: "user",
} as const;

// Combine all roles into one constant
export const AllRoles = [
  UserRoles.USER,
  AdminRoles.SUB_ADMIN,
  AdminRoles.NORMAL_ADMIN,
  AdminRoles.SUPER_ADMIN,
  StoreRoles.STORE_ADMIN,
  StoreRoles.STORE_MANAGER,
  StoreRoles.STORE_STAFF,
] as const;

// Define the structure of authProps using these constants
export const authProps = {
  ALL: AllRoles,
  USER: [UserRoles.USER],
  ADMIN: [
    AdminRoles.SUB_ADMIN,
    AdminRoles.NORMAL_ADMIN,
    AdminRoles.SUPER_ADMIN,
  ],
  STORE: [
    StoreRoles.STORE_ADMIN,
    StoreRoles.STORE_MANAGER,
    StoreRoles.STORE_STAFF,
  ],
} as const;
