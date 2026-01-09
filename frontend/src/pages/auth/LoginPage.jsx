
import { LoginForm } from "@/components/auth/LoginForm"
import { HealthNetLogo } from "@/components/icons"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Absolute Home Link (Mobile & Desktop) */}
            <div className="absolute top-4 left-4 z-50 lg:top-8 lg:left-8">
                <Button variant="outline" asChild className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                    <Link to="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to Home
                    </Link>
                </Button>
            </div>

            {/* Left side - Branding Information */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900 border-r border-slate-800">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

                <div className="relative z-10 flex flex-col justify-between h-full p-16 text-slate-50">
                    <div className="space-y-2 mt-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <HealthNetLogo className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">HealthNet</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight leading-[1.1] max-w-lg">
                            National Electronic <span className="text-blue-500">Health Records</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-md leading-relaxed pt-4">
                            A unified, secure, and resilient infrastructure connecting healthcare facilities across Ethiopia for better patient outcomes.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="grid gap-6">
                            {[
                                "Secure AES-256 Encrypted Access",
                                "Real-time Medical History Retrieval",
                                "Emergency QR Integration for First Responders",
                                "Role-Based Access Control (RBAC)"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                        <CheckCircle2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <span className="font-medium text-slate-200">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-slate-800/60">
                            <p className="text-xs text-slate-600 font-mono">
                                &copy; {new Date().getFullYear()} Ethiopian Ministry of Health • Authorized Personnel Only
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex w-full lg:w-[45%] items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950">
                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    {/* Mobile Logo Only */}
                    <div className="flex flex-col items-center gap-2 lg:hidden mb-8">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                            <HealthNetLogo className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">HealthNet</h2>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
