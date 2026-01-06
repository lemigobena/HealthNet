
import { Button } from "@/components/ui/button"
import { HeartPulseIcon, ShieldCheckIcon, QRCodeIcon } from "@/components/icons"
import { Link } from "react-router-dom"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-20 lg:py-32">
            {/* Background pattern with enhanced depth and noise texture */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Mesh Gradient 1 */}
                <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse [animation-duration:8s]" />
                {/* Mesh Gradient 2 */}
                <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px] animate-pulse [animation-duration:10s]" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%) opacity-30" />

                {/* Noise Texture for Premium Feel */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center">
                    {/* Badge with animation */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/20 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-700 shadow-sm">
                        <HeartPulseIcon className="h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <span className="tracking-wide">National EHR System for Ethiopia</span>
                    </div>

                    {/* Main heading with staggered animation */}
                    <h1 className="max-w-5xl text-balance text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-backwards [animation-delay:200ms] leading-[1.1]">
                        Unified Healthcare Records for a <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 relative">
                            Healthier Ethiopia
                            {/* Underline decoration */}
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-600/20 dark:text-blue-400/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-8 max-w-2xl text-pretty text-xl text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-backwards [animation-delay:400ms] leading-relaxed">
                        HealthNet connects healthcare facilities nationwide, providing secure, instant access to patient records.
                        From rural health posts to specialized hospitals — one unified system.
                    </p>

                    {/* CTA Buttons with hover animations */}
                    <div className="mt-12 flex flex-col gap-5 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-backwards [animation-delay:600ms]">
                        <Button size="lg" asChild className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] hover:-translate-y-0.5 rounded-full">
                            <Link to="/login">
                                <span className="relative flex items-center gap-2">
                                    Access Portal
                                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">→</span>
                                </span>
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-medium border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900 transition-all hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg rounded-full">
                            <Link to="/emergency">
                                <QRCodeIcon className="mr-2 h-5 w-5 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                                Emergency Access
                            </Link>
                        </Button>
                    </div>

                    {/* Trust indicators with enhanced styling */}
                    <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 animate-in fade-in duration-1000 fill-mode-backwards [animation-delay:800ms]">
                        <div className="flex items-center gap-3 group">
                            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2.5 transition-transform group-hover:scale-110">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">HTTPS Encrypted</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2.5 transition-transform group-hover:scale-110">
                                <QRCodeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">QR Emergency Access</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2.5 transition-transform group-hover:scale-110">
                                <HeartPulseIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">WHO Compliant</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
