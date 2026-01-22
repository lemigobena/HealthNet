import { useState } from "react";
import { DashboardHeader, Sidebar } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Building2, Users, ShieldAlert, UserCog } from "lucide-react";

// Wrapper for Super Admin Pages to provide the layout
export default function SuperAdminLayout({ children, title, subtitle }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { href: "/super-admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/super-admin/hospitals", icon: Building2, label: "My Hospitals" },
        { href: "/super-admin/register-hospital", icon: Building2, label: "Register Hospital" },
        { href: "/super-admin/users", icon: Users, label: "All Users" },
        { href: "/super-admin/audit-logs", icon: ShieldAlert, label: "Audit Logs" },
        { href: "/super-admin/profile", icon: UserCog, label: "Profile" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={navItems} />
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
