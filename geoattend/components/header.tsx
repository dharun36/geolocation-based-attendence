"use client"

import { Bell, User } from "lucide-react"

interface HeaderProps {
  userName: string
  userRole: string
}

export function Header({ userName, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome back, {userName}</h2>
          <p className="text-sm text-gray-500 capitalize">{userRole.toLowerCase()}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-full p-2 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 hover:bg-gray-200 transition-colors">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{userName}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
