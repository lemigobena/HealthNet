
import { Link } from "react-router-dom"
import { HealthNetLogo, FacebookIcon, TwitterIcon, LinkedinIcon, MailIcon, PhoneIcon, MapPinIcon } from "@/components/icons"

export function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-200 py-16 border-t border-slate-900">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                            <HealthNetLogo className="h-8 w-8 text-white" aria-hidden="true" />
                            <span className="text-xl font-bold text-white">HealthNet</span>
                        </Link>
                        <p className="max-w-xs text-sm text-slate-400 leading-relaxed">
                            Ethiopia's National Electronic Health Record system, connecting healthcare facilities for better patient
                            care and unified health information management.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: FacebookIcon, label: "Facebook" },
                                { icon: TwitterIcon, label: "Twitter" },
                                { icon: LinkedinIcon, label: "LinkedIn" }
                            ].map((social, i) => (
                                <Link
                                    key={i}
                                    to="#"
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:-translate-y-1"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                            <li><a href="#roles" className="hover:text-blue-400 transition-colors">User Roles</a></li>
                            <li><Link to="/emergency" className="hover:text-blue-400 transition-colors">Emergency Access</Link></li>
                            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Healthcare Portal Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPinIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                                <span>Sudan St., Addis Ababa, Ethiopia<br />Ministry of Health</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <PhoneIcon className="h-5 w-5 text-blue-500 shrink-0" aria-hidden="true" />
                                <span>+251 11 551 7011</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MailIcon className="h-5 w-5 text-blue-500 shrink-0" aria-hidden="true" />
                                <span>info@healthnet.gov.et</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Legal</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Data Protection</Link></li>
                            <li><Link to="#" className="hover:text-blue-400 transition-colors">Accessibility Statement</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} HealthNet National EHR. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Powered by eHealth Ethiopia</span>
                        <Link to="https://www.moh.gov.et" target="_blank" className="hover:text-blue-400 transition-colors">Ministry of Health</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
