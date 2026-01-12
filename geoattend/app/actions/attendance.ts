"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDistance, calculateHours, calculateLateMinutes, formatDate } from "@/lib/utils"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { AttendanceStatus } from "@prisma/client"

// Validation schemas
const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  locationId: z.string().optional(),
})

const checkOutSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
})

/**
 * Check in attendance with GPS validation
 */
export async function checkInAction(data: {
  latitude: number
  longitude: number
  accuracy: number
  locationId?: string
}) {
  try {
    const user = await getCurrentUser()

    // Validate input
    const validated = checkInSchema.parse(data)

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        date: today,
      },
    })

    if (existingAttendance?.checkInTime) {
      return {
        success: false,
        error: "You have already checked in today"
      }
    }

    // Get allowed locations for the organization
    const locations = await prisma.location.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
    })

    if (locations.length === 0) {
      return {
        success: false,
        error: "No active locations configured. Contact your administrator.",
      }
    }

    // Find the nearest location and check if within geo-fence
    let nearestLocation = null
    let minDistance = Infinity
    let isWithinGeofence = false

    for (const location of locations) {
      const distance = calculateDistance(
        validated.latitude,
        validated.longitude,
        location.latitude,
        location.longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestLocation = location
      }

      if (distance <= location.radius) {
        isWithinGeofence = true
        nearestLocation = location
        break
      }
    }

    if (!isWithinGeofence || !nearestLocation) {
      return {
        success: false,
        error: `You are ${Math.round(minDistance)}m away from the nearest location (${nearestLocation?.name || 'Unknown'}). You must be within ${nearestLocation?.radius || 0}m to check in.`,
      }
    }

    // Check GPS accuracy (relaxed for development - 100000m = 100km for browser testing)
    // In production, you should set this to 50m for better accuracy
    const accuracyThreshold = process.env.NODE_ENV === 'development' ? 100000 : 50
    if (validated.accuracy > accuracyThreshold) {
      return {
        success: false,
        error: `GPS accuracy is too low (${Math.round(validated.accuracy)}m). Please try again when GPS signal is stronger (required: <${accuracyThreshold}m).`,
      }
    }

    // Calculate if late
    const checkInTime = new Date()
    const lateMinutes = calculateLateMinutes(checkInTime, "09:00") // Default office time
    const isLate = lateMinutes > 0

    // Determine status
    let status: AttendanceStatus = AttendanceStatus.PRESENT
    if (isLate && lateMinutes > 60) {
      status = AttendanceStatus.HALF_DAY // More than 1 hour late
    } else if (isLate) {
      status = AttendanceStatus.LATE
    }

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date_organizationId: {
          userId: user.id,
          date: today,
          organizationId: user.organizationId,
        },
      },
      update: {
        checkInTime,
        checkInLatitude: validated.latitude,
        checkInLongitude: validated.longitude,
        checkInAccuracy: validated.accuracy,
        checkInLocationId: nearestLocation.id,
        status,
        isLate,
        lateByMinutes: lateMinutes,
      },
      create: {
        userId: user.id,
        organizationId: user.organizationId,
        date: today,
        checkInTime,
        checkInLatitude: validated.latitude,
        checkInLongitude: validated.longitude,
        checkInAccuracy: validated.accuracy,
        checkInLocationId: nearestLocation.id,
        status,
        isLate,
        lateByMinutes: lateMinutes,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "ATTENDANCE_CHECK_IN",
        entityType: "Attendance",
        entityId: attendance.id,
        userId: user.id,
        organizationId: user.organizationId,
        newValues: JSON.stringify({
          checkInTime,
          location: nearestLocation.name,
          isLate,
          lateByMinutes: lateMinutes,
        }),
      },
    })

    revalidatePath("/attendance")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: isLate
        ? `Checked in successfully (${lateMinutes} minutes late)`
        : "Checked in successfully",
      data: {
        checkInTime,
        location: nearestLocation.name,
        isLate,
        lateByMinutes: lateMinutes,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Check-in error:", error)
    return { success: false, error: "Failed to check in" }
  }
}

/**
 * Check out attendance
 */
export async function checkOutAction(data: {
  latitude: number
  longitude: number
  accuracy: number
}) {
  try {
    const user = await getCurrentUser()

    // Validate input
    const validated = checkOutSchema.parse(data)

    // Get today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        date: today,
      },
    })

    if (!attendance) {
      return {
        success: false,
        error: "You haven't checked in today"
      }
    }

    if (!attendance.checkInTime) {
      return {
        success: false,
        error: "You haven't checked in today"
      }
    }

    if (attendance.checkOutTime) {
      return {
        success: false,
        error: "You have already checked out today"
      }
    }

    // Check GPS accuracy (relaxed for development - 100000m = 100km for browser testing)
    const accuracyThreshold = process.env.NODE_ENV === 'development' ? 100000 : 50
    if (validated.accuracy > accuracyThreshold) {
      return {
        success: false,
        error: `GPS accuracy is too low (${Math.round(validated.accuracy)}m). Please try again when GPS signal is stronger (required: <${accuracyThreshold}m).`,
      }
    }

    const checkOutTime = new Date()
    const totalHours = calculateHours(attendance.checkInTime, checkOutTime)

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        checkOutLatitude: validated.latitude,
        checkOutLongitude: validated.longitude,
        checkOutAccuracy: validated.accuracy,
        totalHours,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "ATTENDANCE_CHECK_OUT",
        entityType: "Attendance",
        entityId: attendance.id,
        userId: user.id,
        organizationId: user.organizationId,
        newValues: JSON.stringify({
          checkOutTime,
          totalHours,
        }),
      },
    })

    revalidatePath("/attendance")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Checked out successfully",
      data: {
        checkOutTime,
        totalHours,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error("Check-out error:", error)
    return { success: false, error: "Failed to check out" }
  }
}

/**
 * Get today's attendance status
 */
export async function getTodayAttendanceAction() {
  try {
    const user = await getCurrentUser()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        date: today,
      },
      include: {
        checkInLocation: true,
      },
    })

    return {
      success: true,
      data: attendance,
    }
  } catch (error) {
    console.error("Get attendance error:", error)
    return { success: false, error: "Failed to get attendance" }
  }
}
