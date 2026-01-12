"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { AuthError } from "next-auth"

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  organizationSlug: z.string().min(2, "Organization slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function loginAction(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    }

    // Validate input
    const validatedData = loginSchema.parse(rawData)

    // Sign in using NextAuth
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { success: true, message: "Login successful" }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.cause?.err?.message || "Invalid credentials" }
    }
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "An error occurred during login" }
  }
}

export async function registerAction(formData: FormData) {
  try {
    const rawData = {
      organizationName: formData.get("organizationName"),
      organizationSlug: formData.get("organizationSlug"),
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }

    // Validate input
    const validatedData = registerSchema.parse(rawData)

    // Check if organization slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: validatedData.organizationSlug },
    })

    if (existingOrg) {
      return { success: false, error: "Organization slug already taken" }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.organizationName,
          slug: validatedData.organizationSlug,
          email: validatedData.email,
          isActive: true,
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: "ADMIN",
          organizationId: organization.id,
          isActive: true,
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "ORGANIZATION_CREATED",
          entityType: "Organization",
          entityId: organization.id,
          userId: user.id,
          organizationId: organization.id,
          newValues: JSON.stringify({
            organizationName: organization.name,
            adminEmail: user.email,
          }),
        },
      })

      return { organization, user }
    })

    // Auto sign in after registration
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { 
      success: true, 
      message: "Registration successful",
      data: {
        organizationId: result.organization.id,
        userId: result.user.id,
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}
