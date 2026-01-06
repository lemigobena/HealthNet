
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UsersIcon, StethoscopeIcon, FlaskIcon, ClipboardListIcon } from "@/components/icons"
import { CheckCircle2 } from "lucide-react"

const roles = [
    {
        icon: ClipboardListIcon,
        title: "Administrator",
        description: "Manage system users, facility configurations, and audit logs.",
        permissions: [
            "User account management",
            "Facility configuration",
            "System audit trails",
            "Security policies",
        ],
        color: "bg-blue-500",
        gradient: "from-blue-600 to-indigo-600",
        border: "group-hover:border-blue-500/50",
        bg: "group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/10",
        text: "text-blue-600"
    },
    {
        icon: StethoscopeIcon,
        title: "Doctor",
        description: "Diagnose patients, prescribe treatments, and track medical history.",
        permissions: [
            "Patient diagnosis & records",
            "Prescription management",
            "Lab result interpretation",
            "Appointment scheduling",
        ],
        color: "bg-teal-500",
        gradient: "from-teal-600 to-emerald-600",
        border: "group-hover:border-teal-500/50",
        bg: "group-hover:bg-teal-50/50 dark:group-hover:bg-teal-950/10",
        text: "text-teal-600"
    },
    {
        icon: FlaskIcon,
        title: "Lab Technician",
        description: "Process diagnostic tests and upload verified results directly.",
        permissions: [
            "Sample tracking",
            "Result upload & verification",
            "Test queue management",
            "Lab inventory access",
        ],
        color: "bg-amber-500",
        gradient: "from-amber-600 to-orange-600",
        border: "group-hover:border-amber-500/50",
        bg: "group-hover:bg-amber-50/50 dark:group-hover:bg-amber-950/10",
        text: "text-amber-600"
    },
    {
        icon: UsersIcon,
        title: "Patient",
        description: "Access personal health records and manage care journey.",
        permissions: [
            "View personal records",
            "QR code for emergency",
            "Appointment requests",
            "Track prescriptions",
        ],
        color: "bg-cyan-500",
        gradient: "from-cyan-600 to-blue-600",
        border: "group-hover:border-cyan-500/50",
        bg: "group-hover:bg-cyan-50/50 dark:group-hover:bg-cyan-950/10",
        text: "text-cyan-600"
    },
]

export function UserRolesSection() {
    return (
        <section className="py-24 lg:py-32 relative overflow-hidden" id="roles">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-200/20 dark:bg-slate-800/20 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                        Ecosystem Architecture
                    </Badge>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
                        Tailored for Every Role
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                        Secure, role-based interfaces ensure the right data reaches the right person at the right time.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {roles.map((role, index) => (
                        <Card
                            key={index}
                            className={`group relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${role.border} ${role.bg}`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Top Gradient Line */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <CardHeader className="space-y-4">
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                                >
                                    <role.icon className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{role.title}</CardTitle>
                                    <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                        {role.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 pt-2">
                                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors mb-4" />
                                    {role.permissions.map((permission, permIndex) => (
                                        <div key={permIndex} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                            <CheckCircle2 className={`h-4 w-4 shrink-0 transition-colors ${role.text?.replace('text-', 'text-') || 'text-slate-400'} group-hover:text-primary`} />
                                            <span>{permission}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
