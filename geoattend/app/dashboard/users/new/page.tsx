"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserAction } from "@/app/actions/users"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      employeeId: formData.get("employeeId") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "ADMIN" | "MANAGER" | "EMPLOYEE",
    }

    const result = await createUserAction(data)

    if (result.success) {
      router.push("/dashboard/users")
      router.refresh()
    } else {
      setError(result.error || "Failed to create user")
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/users"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <h1 className="text-3xl font-bold">Add New User</h1>
        <p className="text-gray-600 mt-1">Create a new user account for your organization</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="employeeId">Employee ID *</Label>
            <Input
              id="employeeId"
              name="employeeId"
              type="text"
              required
              placeholder="EMP001"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for this employee
            </p>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              The user will use this password to login
            </p>
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Admin: Full access | Manager: Manage employees | Employee: Basic access
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Link href="/dashboard/users" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Share the email and password with the new user securely</li>
          <li>Encourage users to change their password after first login</li>
          <li>Employee IDs must be unique within your organization</li>
          <li>Managers can only create Employee accounts</li>
        </ul>
      </div>
    </div>
  )
}
