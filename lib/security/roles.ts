export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  THEATRE_ADMIN = "THEATRE_ADMIN",
  HALL_MANAGER = "HALL_MANAGER",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.THEATRE_ADMIN]: 80,
  [Role.HALL_MANAGER]: 60,
  [Role.STAFF]: 40,
  [Role.CUSTOMER]: 10,
};

