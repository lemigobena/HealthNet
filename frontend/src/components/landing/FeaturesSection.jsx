import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    UsersIcon,
    FileTextIcon,
    CalendarIcon,
    FlaskIcon,
    ShieldCheckIcon,
    QRCodeIcon,
    StethoscopeIcon,
    ActivityIcon,
} from "@/components/icons"

const features = [
    {
        icon: UsersIcon,
        title: "Patient Management",
        description:
            "Centralized patient registry with Unique Patient Identifier (UPI) and QR code generation for quick identification.",
        gradient: "from-blue-500 to-cyan-500",
        bg: "bg-blue-500/10",
        text: "text-blue-600"
    },
    {
        icon: FileTextIcon,
        title: "Medical Records",
        description:
            "Secure storage and retrieval of complete patient medical histories including diagnoses, medications, and allergies.",
        gradient: "from-purple-500 to-pink-500",
        bg: "bg-purple-500/10",
        text: "text-purple-600"
    },
    {
        icon: FlaskIcon,
        title: "Lab Results",
        description:
            "Upload, manage, and view laboratory test results with seamless integration between technicians and doctors.",
        gradient: "from-emerald-500 to-teal-500",
        bg: "bg-emerald-500/10",
        text: "text-emerald-600"
    },
    {
        icon: CalendarIcon,
        title: "Appointments",
        description: "Schedule and manage patient appointments with conflict detection and automated notifications.",
        gradient: "from-orange-500 to-red-500",
        bg: "bg-orange-500/10",
        text: "text-orange-600"
    },
    {
        icon: QRCodeIcon,
        title: "Emergency Access",
        description: "Instant access to critical patient information via QR code scan for first responders without login.",
        gradient: "from-red-500 to-rose-500",
        bg: "bg-red-500/10",
        text: "text-red-600"
    },
    {
        icon: ShieldCheckIcon,
        title: "Role-Based Access",
        description:
            "Strict RBAC ensuring data privacy with different access levels for admins, doctors, technicians, and patients.",
        gradient: "from-indigo-500 to-blue-500",
        bg: "bg-indigo-500/10",
        text: "text-indigo-600"
    },
    {
        icon: StethoscopeIcon,
        title: "Doctor Dashboard",
        description: "Comprehensive view of assigned patients, add diagnoses, treatments, and manage clinical workflows.",
        gradient: "from-cyan-500 to-blue-500",
        bg: "bg-cyan-500/10",
        text: "text-cyan-600"
    },
    {
        icon: ActivityIcon,
        title: "Audit Trails",
        description: "Complete logging of all data access and modifications for compliance and security monitoring.",
        gradient: "from-violet-500 to-purple-500",
        bg: "bg-violet-500/10",
        text: "text-violet-600"
    },
]

export function FeaturesSection() {
    return (
        <section className="bg-slate-50 dark:bg-slate-900/50 py-20 lg:py-32" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl mb-6">
                        Comprehensive Healthcare Management
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                        Everything you need to manage patient care, from registration to emergency access, all in one unified
                        platform designed for Ethiopia.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="group relative overflow-hidden border-none bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                            <CardHeader className="pt-8">
                                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <feature.icon className={`h-7 w-7 ${feature.text}`} aria-hidden="true" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
