import { Button } from "@/components/ui/button"
import { HealthNetLogo, BuildingIcon, UsersIcon, ShieldCheckIcon, ActivityIcon } from "@/components/icons"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "@/services/api"

export function CTASection() {
    const [stats, setStats] = useState({ patients: 0, facilities: 0, security: 100 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/public/stats')
                if (response.data.success) {
                    setStats(response.data.data)
                }
            } catch (error) {
                console.error("Failed to fetch landing stats:", error)
                // Fallback to static numbers on absolute failure
                setStats({ patients: 1240000, facilities: 2840, security: 100 })
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const formatNumber = (num) => {
        if (!num) return "0"
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+"
        if (num >= 1000) return num.toLocaleString() + "+"
        return num.toString() + "+"
    }

    return (
        <section className="relative overflow-hidden bg-blue-600 dark:bg-slate-950 py-20 lg:py-32 transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

            <div className="container relative z-10 mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    <div className="animate-in fade-in zoom-in duration-1000">
                        <HealthNetLogo className="h-20 w-20 mb-8 mx-auto transition-transform hover:scale-110 [&_rect]:fill-white [&_path]:stroke-blue-600 dark:[&_path]:stroke-slate-950" />
                    </div>

                    <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Ready to Transform Healthcare Delivery?
                    </h2>
                    <p className="mt-6 max-w-2xl text-lg text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:200ms]">
                        Join Ethiopia's unified health information ecosystem. Connect your facility to HealthNet and provide better
                        patient care with instant access to complete medical histories.
                    </p>

                    {/* Stats/Proof Section */}
                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 w-full max-w-4xl border-y border-white/20 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:400ms]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-full bg-white/20 p-3 mb-2">
                                <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                {loading ? "..." : formatNumber(stats.patients)}
                            </span>
                            <span className="text-sm text-white/80 uppercase tracking-wider font-medium">Patients Managed</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 border-x border-white/20 px-4">
                            <div className="rounded-full bg-white/20 p-3 mb-2">
                                <ActivityIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                {loading ? "..." : formatNumber(stats.facilities)}
                            </span>
                            <span className="text-sm text-white/80 uppercase tracking-wider font-medium">Health Facilities</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-full bg-white/20 p-3 mb-2">
                                <ShieldCheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <span className="text-2xl font-bold text-white">{stats.security}%</span>
                            <span className="text-sm text-white/80 uppercase tracking-wider font-medium">Data Security</span>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:600ms]">
                        <Button size="lg" asChild className="px-12 py-7 text-lg font-bold shadow-xl transition-all hover:scale-105 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-0 rounded-2xl group">
                            <Link to="/login" className="flex items-center gap-3">
                                <ActivityIcon className="h-6 w-6 animate-pulse" />
                                Get Started
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-10 text-sm text-primary-foreground/60 italic border-t border-primary-foreground/10 pt-6">
                        Compliant with Ethiopian Ministry of Health National eHealth Strategy 2025
                    </p>
                </div>
            </div>
        </section>
    )
}
