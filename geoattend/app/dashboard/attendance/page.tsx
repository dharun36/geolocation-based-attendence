import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AttendanceCheckInOut } from "@/components/attendance-check-in-out"
import { format, startOfMonth, endOfMonth } from "date-fns"

async function getMyAttendance(userId: string, organizationId: string) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  return prisma.attendance.findMany({
    where: {
      userId,
      organizationId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      checkInLocation: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })
}

export default async function AttendancePage() {
  const user = await getCurrentUser()
  const attendanceRecords = await getMyAttendance(user.id, user.organizationId)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 mt-1">
          Manage your daily attendance and view your history
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check-in/Check-out Card */}
        <AttendanceCheckInOut />

        {/* Monthly Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>{format(new Date(), "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-3xl font-bold text-green-600">
                  {attendanceRecords.filter((a: any) => a.status === 'PRESENT').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Present</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <p className="text-3xl font-bold text-yellow-600">
                  {attendanceRecords.filter((a: any) => a.status === 'LATE').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Late</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <p className="text-3xl font-bold text-red-600">
                  {attendanceRecords.filter((a: any) => a.status === 'ABSENT').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Absent</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-3xl font-bold text-blue-600">
                  {attendanceRecords.filter((a: any) => a.totalHours).reduce((sum: number, a: any) => sum + (a.totalHours || 0), 0).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your attendance records for this month</CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No attendance records yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {record.checkInTime 
                        ? format(new Date(record.checkInTime), "h:mm a")
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime 
                        ? format(new Date(record.checkOutTime), "h:mm a")
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {record.checkInLocation?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'PRESENT' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'LATE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : record.status === 'ABSENT'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
