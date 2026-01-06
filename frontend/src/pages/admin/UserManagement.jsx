
import AdminLayout from "@/layouts/AdminLayout"
import { UsersTable } from "@/components/admin/UsersTable"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export default function UserManagement() {
    return (
        <AdminLayout
            title="User Management"
            subtitle="Manage doctors, patients, and administrators"
        >
            <div className="space-y-6">
                <div className="flex justify-end gap-2">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register Doctor
                    </Button>
                    <Button variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register Patient
                    </Button>
                </div>

                <UsersTable />
            </div>
        </AdminLayout>
    )
}
