import { useState } from "react";
import { DashboardHeader, Sidebar } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, Calendar, ClipboardList, FlaskConical, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Doctor Layout with specific navigation
export default function DoctorLayout({ children, title, subtitle, tabs }) {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isMedicalDoctor = user?.doctor_profile?.type === 'MEDICAL_DOCTOR';
    const isLabTechnician = user?.doctor_profile?.type === 'LAB_TECHNICIAN';

    const baseNavItems = [
        { href: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/doctor/patients", icon: Users, label: "My Patients" },
        { href: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    ];

    const doctorNavItems = [...baseNavItems];

    if (isMedicalDoctor) {
        doctorNavItems.push({ href: "/doctor/records", icon: ClipboardList, label: "My Records" });
    }

    if (isLabTechnician) {
        doctorNavItems.push({ href: "/doctor/lab-results", icon: FlaskConical, label: "My Lab Results" });
    }

    doctorNavItems.push({ href: "/doctor/profile", icon: UserCircle, label: "Profile" });

    return (
        <div className="flex h-screen overflow-hidden bg-muted/10">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                items={doctorNavItems}
            />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={() => setSidebarOpen(true)}
                >
                    {tabs && (
                        <div className="flex-1 px-4 self-center max-w-2xl mx-auto">
                            {tabs}
                        </div>
                    )}
                </DashboardHeader>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
