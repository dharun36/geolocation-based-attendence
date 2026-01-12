import { getCurrentUser, requireRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function ReportsPage() {
  const user = await getCurrentUser()
  await requireRole(["ADMIN", "MANAGER"])

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const attendance = await prisma.attendance.findMany({
    where: {
      organizationId: user.organizationId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      user: true,
    },
  })

  // Calculate stats
  const total = attendance.length
  const present = attendance.filter((a) => a.status === "PRESENT").length
  const late = attendance.filter((a) => a.status === "LATE").length
  const absent = attendance.filter((a) => a.status === "ABSENT").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Attendance reports for {startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absent}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check In</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check Out</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">{formatDate(record.date)}</td>
                    <td className="p-4 align-middle font-medium">{record.user.name}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4 align-middle">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">No records found for this month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
