import { useState } from "react";
import { DashboardHeader, Sidebar } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, UserCheck, UserPlus, Users, Stethoscope } from "lucide-react";

// Wrapper for Admin Pages to provide the layout
export default function AdminLayout({ children, title, subtitle }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const adminNavItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/assignment", icon: UserCheck, label: "Assignment" },
        { href: "/admin/register", icon: UserPlus, label: "Register" },
        { href: "/admin/my-patients", icon: Users, label: "My Patients" },
        { href: "/admin/my-doctors", icon: Stethoscope, label: "My Doctors" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-muted/10">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={adminNavItems} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
