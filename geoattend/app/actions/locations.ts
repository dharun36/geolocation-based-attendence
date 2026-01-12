"use server"

import { getCurrentUser, requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const locationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10).max(5000, "Radius must be between 10m and 5000m"),
  description: z.string().optional(),
})

export async function createLocationAction(data: {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  description?: string
}) {
  try {
    const user = await requireAdmin()

    // Validate input
    const validated = locationSchema.parse(data)

    // Create location
    const location = await prisma.location.create({
      data: {
        ...validated,
        organizationId: user.organizationId,
        createdById: user.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LOCATION_CREATED",
        entityType: "Location",
        entityId: location.id,
        userId: user.id,
        organizationId: user.organizationId,
        newValues: JSON.stringify(validated),
      },
    })

    revalidatePath("/dashboard/locations")

    return {
      success: true,
      message: "Location created successfully",
      data: location,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Create location error:", error)
    return { success: false, error: "Failed to create location" }
  }
}

export async function updateLocationAction(id: string, data: {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  description?: string
  isActive: boolean
}) {
  try {
    const user = await requireAdmin()

    // Verify location belongs to user's organization
    const existingLocation = await prisma.location.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!existingLocation) {
      return { success: false, error: "Location not found" }
    }

    // Validate input
    const validated = locationSchema.parse(data)

    // Update location
    const location = await prisma.location.update({
      where: { id },
      data: {
        ...validated,
        isActive: data.isActive,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LOCATION_UPDATED",
        entityType: "Location",
        entityId: location.id,
        userId: user.id,
        organizationId: user.organizationId,
        oldValues: JSON.stringify(existingLocation),
        newValues: JSON.stringify(validated),
      },
    })

    revalidatePath("/dashboard/locations")

    return {
      success: true,
      message: "Location updated successfully",
      data: location,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Update location error:", error)
    return { success: false, error: "Failed to update location" }
  }
}

export async function deleteLocationAction(id: string) {
  try {
    const user = await requireAdmin()

    // Verify location belongs to user's organization
    const location = await prisma.location.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!location) {
      return { success: false, error: "Location not found" }
    }

    // Soft delete by marking as inactive
    await prisma.location.update({
      where: { id },
      data: { isActive: false },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LOCATION_DELETED",
        entityType: "Location",
        entityId: id,
        userId: user.id,
        organizationId: user.organizationId,
        oldValues: JSON.stringify(location),
      },
    })

    revalidatePath("/dashboard/locations")

    return {
      success: true,
      message: "Location deleted successfully",
    }
  } catch (error) {
    console.error("Delete location error:", error)
    return { success: false, error: "Failed to delete location" }
  }
}
