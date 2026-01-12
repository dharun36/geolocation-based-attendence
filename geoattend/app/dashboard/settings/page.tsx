import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <SettingsForm user={user} organization={organization} />
    </div>
  )
}
