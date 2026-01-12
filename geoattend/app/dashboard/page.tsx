import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserCheck, UserX, Clock, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { format } from "date-fns"

async function getDashboardStats(organizationId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get total employees
  const totalEmployees = await prisma.user.count({
    where: {
      organizationId,
      isActive: true,
    },
  })

  // Get today's attendance stats
  const todayAttendance = await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      organizationId,
      date: today,
    },
    _count: true,
  })

  const stats = {
    totalEmployees,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
  }

  todayAttendance.forEach((item: any) => {
    if (item.status === 'PRESENT') stats.presentToday = item._count
    if (item.status === 'LATE') stats.lateToday = item._count
    if (item.status === 'ON_LEAVE') stats.onLeaveToday = item._count
  })

  // Calculate absent (employees who haven't checked in)
  stats.absentToday = totalEmployees - (stats.presentToday + stats.lateToday + stats.onLeaveToday)

  return stats
}

async function getRecentAttendance(organizationId: string, limit = 10) {
  return prisma.attendance.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          employeeId: true,
        },
      },
      checkInLocation: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      checkInTime: 'desc',
    },
    take: limit,
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  const [stats, recentAttendance] = await Promise.all([
    getDashboardStats(user.organizationId),
    getRecentAttendance(user.organizationId),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of your attendance management system
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
        />
        <KPICard
          title="Present Today"
          value={stats.presentToday + stats.lateToday}
          icon={UserCheck}
          className="border-l-4 border-l-green-500"
        />
        <KPICard
          title="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          className="border-l-4 border-l-red-500"
        />
        <KPICard
          title="Late Today"
          value={stats.lateToday}
          icon={Clock}
          className="border-l-4 border-l-yellow-500"
        />
      </div>

      {/* Attendance Summary Chart Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>
              Attendance status for {format(new Date(), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Present</span>
                </div>
                <span className="text-sm font-bold">{stats.presentToday}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Late</span>
                </div>
                <span className="text-sm font-bold">{stats.lateToday}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">On Leave</span>
                </div>
                <span className="text-sm font-bold">{stats.onLeaveToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Absent</span>
                </div>
                <span className="text-sm font-bold">{stats.absentToday}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.totalEmployees > 0
                    ? Math.round(((stats.presentToday + stats.lateToday) / stats.totalEmployees) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats.totalEmployees > 0
                    ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Leave Requests</span>
                <span className="text-lg font-bold text-gray-900">{stats.onLeaveToday}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Latest attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAttendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No attendance records yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map((attendance: any) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">
                      {attendance.user.name}
                    </TableCell>
                    <TableCell>{attendance.user.employeeId || '-'}</TableCell>
                    <TableCell>
                      {attendance.checkInTime
                        ? format(new Date(attendance.checkInTime), "h:mm a")
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {attendance.checkInLocation?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attendance.status === 'PRESENT'
                          ? 'bg-green-100 text-green-800'
                          : attendance.status === 'LATE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : attendance.status === 'ABSENT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                        {attendance.status}
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
