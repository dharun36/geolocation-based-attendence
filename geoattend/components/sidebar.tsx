"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  FileText,
  Settings,
  LogOut
} from "lucide-react"
import { UserRole } from "@prisma/client"

interface SidebarProps {
  userRole: UserRole
  organizationName: string
}

export function Sidebar({ userRole, organizationName }: SidebarProps) {
  const pathname = usePathname()

  // Define navigation based on role
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    },
    {
      name: "Attendance",
      href: "/dashboard/attendance",
      icon: Calendar,
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      name: "Locations",
      href: "/dashboard/locations",
      icon: MapPin,
      roles: [UserRole.ADMIN],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: FileText,
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: [UserRole.ADMIN],
    },
  ]

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo / Organization Name */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">GeoAttend</h1>
      </div>

      {/* Organization Info */}
      <div className="px-6 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Organization</p>
        <p className="text-sm font-medium mt-1 truncate">{organizationName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
