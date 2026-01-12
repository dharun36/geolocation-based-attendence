import { auth } from "@/auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

/**
 * Get the current session and user
 * Redirects to login if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  return session.user
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Require specific roles or redirect
 */
export async function requireRole(roles: UserRole[]) {
  const user = await getCurrentUser()
  
  if (!hasRole(user.role, roles)) {
    redirect("/dashboard")
  }
  
  return user
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return await requireRole([UserRole.ADMIN])
}

/**
 * Check if user is admin or manager
 */
export async function requireAdminOrManager() {
  return await requireRole([UserRole.ADMIN, UserRole.MANAGER])
}

/**
 * Verify user belongs to the same organization
 */
export async function verifyOrganizationAccess(organizationId: string) {
  const user = await getCurrentUser()
  
  if (user.organizationId !== organizationId) {
    throw new Error("Unauthorized: Access denied to this organization")
  }
  
  return user
}
