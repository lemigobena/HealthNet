
import { useState } from "react";
import { DashboardHeader, Sidebar } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, FileText, FlaskConical, Calendar, User, ShieldAlert } from "lucide-react";

// Patient Layout with specific navigation based on user request
export default function PatientLayout({ children, title, subtitle }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const patientNavItems = [
        { href: "/patient", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/patient/records", icon: FileText, label: "My Records" },
        { href: "/patient/lab-results", icon: FlaskConical, label: "My Lab Results" },
        { href: "/patient/appointments", icon: Calendar, label: "My Appointments" },
        { href: "/patient/profile", icon: User, label: "Profile" },
        { href: "/patient/emergency-info", icon: ShieldAlert, label: "Emergency Info" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-muted/10">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                items={patientNavItems}
            />
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
