import type { UserRole } from "../api/types";

/**
 * Get the default avatar image path based on user role
 * @param role - The user's role
 * @returns Path to the default avatar image
 */
export function getDefaultAvatar(role: UserRole | undefined | null): string {
  if (!role) {
    return "/default-avatars/admin.png";
  }
  
  const avatarMap: Record<UserRole, string> = {
    admin: "/default-avatars/admin.png",
    corporate_officer: "/default-avatars/corporate.png",
    facility_manager: "/default-avatars/facility-manager.png",
    nurse: "/default-avatars/nurse.png",
  };
  
  return avatarMap[role] || "/default-avatars/admin.png";
}

