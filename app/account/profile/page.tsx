import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/profile-form"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">Manage your profile information.</p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  )
}

