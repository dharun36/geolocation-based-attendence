import { getCurrentUser, requireRole } from "@/lib/auth"
import { getUsersAction } from "@/app/actions/users"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Trash2, Edit } from "lucide-react"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { role?: string; search?: string }
}) {
  const user = await getCurrentUser()
  await requireRole(["ADMIN", "MANAGER"])

  const result = await getUsersAction({
    role: searchParams.role as any,
    search: searchParams.search,
  })

  const users = result.success ? result.data : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600 mt-1">Manage your organization's users</p>
        </div>
        <Link href="/dashboard/users/new">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700">Filter by Role</label>
            <select
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const url = new URL(window.location.href)
                if (e.target.value) {
                  url.searchParams.set("role", e.target.value)
                } else {
                  url.searchParams.delete("role")
                }
                window.location.href = url.toString()
              }}
              defaultValue={searchParams.role || ""}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              className="ml-2 w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={searchParams.search || ""}
              onChange={(e) => {
                const url = new URL(window.location.href)
                if (e.target.value) {
                  url.searchParams.set("search", e.target.value)
                } else {
                  url.searchParams.delete("search")
                }
                setTimeout(() => {
                  window.location.href = url.toString()
                }, 500)
              }}
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                {user.role === "ADMIN" && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{u.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{u.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "MANAGER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    {user.role === "ADMIN" && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/users/${u.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user.id !== u.id && (
                            <form action={`/api/users/${u.id}/delete`} method="POST">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user.role === "ADMIN" ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold mt-1">{users?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Admins</div>
          <div className="text-2xl font-bold mt-1">
            {users?.filter((u: any) => u.role === "ADMIN").length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Employees</div>
          <div className="text-2xl font-bold mt-1">
            {users?.filter((u: any) => u.role === "EMPLOYEE").length || 0}
          </div>
        </Card>
      </div>
    </div>
  )
}
