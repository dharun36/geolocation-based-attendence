import { User, Organization, Attendance, Location, UserRole, AttendanceStatus } from "@prisma/client"

// Extended types with relations
export type UserWithOrganization = User & {
  organization: Organization
}

export type AttendanceWithUser = Attendance & {
  user: User
  checkInLocation?: Location | null
}

export type AttendanceWithRelations = Attendance & {
  user: {
    id: string
    name: string
    email: string
    employeeId: string | null
  }
  checkInLocation?: {
    id: string
    name: string
  } | null
}

// Session types for NextAuth
export type SessionUser = {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId: string
  organizationSlug: string
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export type CheckInInput = {
  latitude: number
  longitude: number
  accuracy: number
  locationId?: string
}

export type CheckOutInput = {
  latitude: number
  longitude: number
  accuracy: number
}

export type CreateUserInput = {
  email: string
  password: string
  name: string
  phone?: string
  employeeId?: string
  role: UserRole
}

export type CreateLocationInput = {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  description?: string
}

// Dashboard stats
export type DashboardStats = {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  onLeaveToday: number
}

// Attendance filters
export type AttendanceFilters = {
  startDate?: string
  endDate?: string
  userId?: string
  status?: AttendanceStatus
}

// Export Prisma enums for convenience
export { UserRole, AttendanceStatus } from "@prisma/client"
