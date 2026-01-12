"use client"

import { Card } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"

export function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`)
  }

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (role) {
      params.set("role", role)
    } else {
      params.delete("role")
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Card className="p-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Filter by Role</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-[200px]"
            onChange={(e) => handleRoleChange(e.target.value)}
            defaultValue={searchParams.get("role") || ""}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 block mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => {
              // Debounce implementation
              const value = e.target.value
              const timeoutId = setTimeout(() => handleSearch(value), 500)
              return () => clearTimeout(timeoutId)
            }}
          />
        </div>
      </div>
    </Card>
  )
}
