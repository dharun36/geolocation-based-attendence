"use server"

import { getCurrentUser, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  employeeId: z.string().min(1, "Employee ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
})

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  employeeId: z.string().min(1, "Employee ID is required").optional(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

/**
 * Get all users in the organization (Admin/Manager only)
 */
export async function getUsersAction(filters?: {
  role?: UserRole
  search?: string
}) {
  try {
    const user = await getCurrentUser()

    // Only admins and managers can view all users
    await requireRole(["ADMIN", "MANAGER"])

    const where: any = {
      organizationId: user.organizationId,
    }

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { employeeId: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: users,
    }
  } catch (error) {
    console.error("Get users error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    }
  }
}

/**
 * Create a new user (Admin/Manager only)
 */
export async function createUserAction(data: {
  name: string
  email: string
  employeeId: string
  password: string
  role: UserRole
}) {
  try {
    const currentUser = await getCurrentUser()

    // Only admins and managers can create users
    await requireRole(["ADMIN", "MANAGER"])

    // Managers can only create employees
    if (currentUser.role === "MANAGER" && data.role !== "EMPLOYEE") {
      return {
        success: false,
        error: "Managers can only create employee accounts",
      }
    }

    // Validate input
    const validated = createUserSchema.parse(data)

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingEmail) {
      return {
        success: false,
        error: "Email already exists",
      }
    }

    // Check if employee ID already exists in this organization
    const existingEmployeeId = await prisma.user.findFirst({
      where: {
        organizationId: currentUser.organizationId,
        employeeId: validated.employeeId,
      },
    })

    if (existingEmployeeId) {
      return {
        success: false,
        error: "Employee ID already exists in your organization",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        employeeId: validated.employeeId,
        password: hashedPassword,
        role: validated.role,
        organizationId: currentUser.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "USER_CREATED",
        entityType: "User",
        entityId: newUser.id,
        userId: currentUser.id,
        organizationId: currentUser.organizationId,
        newValues: JSON.stringify({
          userName: newUser.name,
          userEmail: newUser.email,
          userRole: newUser.role,
        }),
      },
    })

    revalidatePath("/dashboard/users")

    return {
      success: true,
      message: "User created successfully",
      data: newUser,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Create user error:", error)
    return { success: false, error: "Failed to create user" }
  }
}

/**
 * Update an existing user (Admin/Manager only)
 */
export async function updateUserAction(data: {
  id: string
  name?: string
  email?: string
  employeeId?: string
  role?: UserRole
  password?: string
}) {
  try {
    const currentUser = await getCurrentUser()

    // Only admins and managers can update users
    await requireRole(["ADMIN", "MANAGER"])

    // Validate input
    const validated = updateUserSchema.parse(data)

    // Get the user to be updated
    const userToUpdate = await prisma.user.findFirst({
      where: {
        id: validated.id,
        organizationId: currentUser.organizationId,
      },
    })

    if (!userToUpdate) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Managers cannot update admins or other managers
    if (
      currentUser.role === "MANAGER" &&
      (userToUpdate.role === "ADMIN" || userToUpdate.role === "MANAGER")
    ) {
      return {
        success: false,
        error: "You don't have permission to update this user",
      }
    }

    // Prevent users from changing their own role
    if (currentUser.id === validated.id && validated.role) {
      return {
        success: false,
        error: "You cannot change your own role",
      }
    }

    // Check for email conflicts
    if (validated.email && validated.email !== userToUpdate.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validated.email },
      })

      if (existingEmail) {
        return {
          success: false,
          error: "Email already exists",
        }
      }
    }

    // Check for employee ID conflicts
    if (validated.employeeId && validated.employeeId !== userToUpdate.employeeId) {
      const existingEmployeeId = await prisma.user.findFirst({
        where: {
          organizationId: currentUser.organizationId,
          employeeId: validated.employeeId,
          id: { not: validated.id },
        },
      })

      if (existingEmployeeId) {
        return {
          success: false,
          error: "Employee ID already exists",
        }
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (validated.name) updateData.name = validated.name
    if (validated.email) updateData.email = validated.email
    if (validated.employeeId) updateData.employeeId = validated.employeeId
    if (validated.role) updateData.role = validated.role
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: validated.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATED",
        entityType: "User",
        entityId: updatedUser.id,
        userId: currentUser.id,
        organizationId: currentUser.organizationId,
        newValues: JSON.stringify({
          changes: updateData,
        }),
      },
    })

    revalidatePath("/dashboard/users")

    return {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Update user error:", error)
    return { success: false, error: "Failed to update user" }
  }
}

/**
 * Delete a user (Admin only)
 */
export async function deleteUserAction(userId: string) {
  try {
    const currentUser = await getCurrentUser()

    // Only admins can delete users
    await requireRole(["ADMIN"])

    // Prevent self-deletion
    if (currentUser.id === userId) {
      return {
        success: false,
        error: "You cannot delete your own account",
      }
    }

    // Get user to delete
    const userToDelete = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: currentUser.organizationId,
      },
    })

    if (!userToDelete) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Delete user (CASCADE will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "USER_DELETED",
        entityType: "User",
        entityId: userId,
        userId: currentUser.id,
        organizationId: currentUser.organizationId,
        newValues: JSON.stringify({
          deletedUserName: userToDelete.name,
          deletedUserEmail: userToDelete.email,
        }),
      },
    })

    revalidatePath("/dashboard/users")

    return {
      success: true,
      message: "User deleted successfully",
    }
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false, error: "Failed to delete user" }
  }
}
