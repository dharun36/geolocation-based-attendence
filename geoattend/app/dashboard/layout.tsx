import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { name: true },
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        userRole={user.role} 
        organizationName={organization?.name || "Organization"}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={user.name} userRole={user.role} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
