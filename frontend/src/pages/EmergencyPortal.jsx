import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    AlertTriangle,
    ShieldCheck,
    Phone,
    Droplets,
    Activity,
    User,
    Loader2,
    CheckCircle2,
    HeartPulse,
    Stethoscope,
    MapPin,
    Calendar,
    Thermometer,
    Pill
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import api from "@/services/api"


export default function EmergencyPortal() {
    const { id } = useParams()
    const [patientSearchId, setPatientSearchId] = useState(id || "")
    const [isLoading, setIsLoading] = useState(false)
    const [emergencyData, setEmergencyData] = useState(null)
    const [error, setError] = useState("")
    const [verificationInput, setVerificationInput] = useState("")
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        if (id) {
            setPatientSearchId(id)
            handleAutoSearch(id)
        }
    }, [id])

    const handleAutoSearch = async (searchId) => {
        setIsLoading(true)
        setError("")
        setEmergencyData(null)
        setIsVerified(false)

        try {
            const res = await api.get(`/qr/emergency-search/${searchId}`)
            setEmergencyData(res.data.data)
            // Auto-verify if ID comes from URL (QR Scan)
            if (searchId) {
                setIsVerified(true)
            }
        } catch (err) {
            console.error("Emergency search error:", err)
            setError(err.response?.data?.message || "Patient Registry ID not found or restricted.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = (e) => {
        e.preventDefault()
        if (emergencyData && verificationInput.trim().toUpperCase() === emergencyData.patient.patient_id.toUpperCase()) {
            setIsVerified(true)
        } else {
            setError("Incorrect Patient ID. Access Denied.")
        }
    }

    const handleSearch = async (e) => {
        if (e) e.preventDefault()
        if (!patientSearchId) return

        setIsLoading(true)
        setError("")
        setEmergencyData(null)
        setIsVerified(false)

        try {
            const res = await api.get(`/qr/emergency-search/${patientSearchId}`)
            setEmergencyData(res.data.data)
            // Manual search also implies verification since they entered the ID
            setIsVerified(true)
        } catch (err) {
            console.error("Emergency search error:", err)
            setError(err.response?.data?.message || "Patient Registry ID not found or restricted.")
        } finally {
            setIsLoading(false)
        }
    }

    // Helper to calculate age
    const getAge = (dob) => {
        if (!dob) return "N/A"
        const birthDate = new Date(dob)
        const ageDifMs = Date.now() - birthDate.getTime()
        const ageDate = new Date(ageDifMs)
        return Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-rose-500/30">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-rose-500/5 blur-3xl animate-pulse duration-[4s]" />
                <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-3xl animate-pulse duration-[6s] delay-1000" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-rose-100 dark:border-rose-900/20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-rose-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative h-9 w-9 bg-rose-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <HeartPulse className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white">
                                Health<span className="text-rose-600">Net</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Emergency</span>
                        </div>
                    </Link>
                    <Link to="/login">
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold tracking-tight">
                            Provider Login <User className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
                {!emergencyData ? (
                    /* SEARCH STATE */
                    <div className="max-w-xl mx-auto mt-12 md:mt-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest border border-rose-200 dark:border-rose-800">
                                <AlertTriangle className="h-3.5 w-3.5" /> First Responder Access
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Emergency Search
                            </h1>
                            <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
                                Scan a HealthNet QR code or manually enter the Patient ID to access critical medical records.
                            </p>
                        </div>

                        <Card className="border-0 shadow-2xl shadow-rose-500/10 ring-1 ring-rose-100 dark:ring-rose-900 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardContent className="p-8 space-y-6">
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                            <Input
                                                placeholder="Enter Patient ID (e.g. PT-1234567890)"
                                                className="h-12 pl-12 text-lg uppercase font-mono tracking-wider"
                                                value={patientSearchId}
                                                onChange={(e) => setPatientSearchId(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Retrieving Records...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="mr-2 h-5 w-5" /> Access Emergency Profile
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or use a scanner</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="text-slate-500 text-sm">
                                        Using a dedicated QR scanner? The URL will automatically verify access.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 animate-in fade-in zoom-in duration-300 shadow-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p className="font-bold text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                ) : !isVerified ? (
                    // This state should rarely be hit now with auto-verify, but keeping as fallback
                    <div className="max-w-md mx-auto mt-20 space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="text-center space-y-2">
                            <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 mb-4 text-2xl font-black">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold">Manual Verification Required</h2>
                            <p className="text-muted-foreground">Please confirm the Patient ID to unlock records.</p>
                        </div>
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleVerify} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Enter Patient ID"
                                            value={verificationInput}
                                            onChange={(e) => setVerificationInput(e.target.value)}
                                            className="text-center font-mono uppercase tracking-widest text-lg h-12"
                                            autoFocus
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 font-bold bg-rose-600 hover:bg-rose-700">
                                        Unlock Records
                                    </Button>
                                    {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* DATA STATE */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                        {/* ID HEADER CARD */}
                        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 ring-1 ring-slate-100 dark:ring-slate-800">
                            {/* Header Gradient */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-rose-600 to-rose-500" />

                            <div className="relative pt-10 px-6 pb-6 md:px-10">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                    {/* Profile Image / Initials */}
                                    <div className="h-32 w-32 rounded-2xl bg-white p-1.5 shadow-xl rotate-3 md:rotate-0 transition-transform hover:rotate-2">
                                        <div className="h-full w-full rounded-xl bg-slate-100 text-slate-300 flex items-center justify-center text-4xl font-black border-4 border-white">
                                            {emergencyData.patient.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2 mb-2">
                                        <div className="flex items-center gap-2 text-rose-100 font-bold text-xs uppercase tracking-widest">
                                            <ShieldCheck className="h-4 w-4" /> Medical ID Verified
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-black text-rose-950 dark:text-white tracking-tight leading-none bg-clip-text">
                                            {emergencyData.patient.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" /> {getAge(emergencyData.patient.dob)} Years ({new Date(emergencyData.patient.dob).toLocaleDateString()})
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User className="h-4 w-4" /> {emergencyData.patient.gender}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                                                <MapPin className="h-4 w-4" /> ID: {patientSearchId}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden md:block">
                                        <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                            <Activity className="h-8 w-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CRITICAL GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                            {/* LEFT COLUMN: Vitals & Allergies (Priority) */}
                            <div className="md:col-span-8 space-y-6">
                                {/* VITALS ROW */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative group">
                                        <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                                        <CardContent className="p-4 relative">
                                            <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mb-1">Blood Type</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black tracking-tighter">
                                                    {emergencyData.blood_type || "-"}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-rose-100 text-[9px] font-bold bg-white/10 w-fit px-2 py-0.5 rounded-full">
                                                <Droplets className="h-2.5 w-2.5" /> Certified Match
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 group">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Conditions</p>
                                                <Activity className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                {emergencyData.emergency_info?.chronic_conditions ? (
                                                    emergencyData.emergency_info.chronic_conditions.split(',').map(c => (
                                                        <Badge key={c} variant="outline" className="border-rose-100 bg-rose-50 text-rose-700 mr-2 mb-1">
                                                            {c.trim()}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">None recorded</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* CRITICAL CARD: Allergies */}
                                <Card className="border-l-4 border-l-rose-500 shadow-lg bg-white dark:bg-slate-900">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 animate-pulse">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Critical Allergies</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {emergencyData.emergency_info?.known_allergies ? (
                                                Array.from(new Set(
                                                    emergencyData.emergency_info.known_allergies
                                                        .split(',')
                                                        .filter(a => a && a.trim())
                                                        .map(a => a.trim().toUpperCase())
                                                )).map(a => (
                                                    <Badge key={a} variant="destructive" className="px-2 py-0.5 text-[10px] font-black tracking-widest bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200">
                                                        {a}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-slate-500 italic flex items-center gap-2 text-xs">
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> No known allergies
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                {/* MEDICATIONS CARD */}
                                <Card className="shadow-lg bg-white dark:bg-slate-900">
                                    <CardHeader className="pb-2 border-b border-slate-50">
                                        <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-700">
                                            <Pill className="h-4 w-4 text-slate-400" /> Current Medications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed space-y-2">
                                            {emergencyData.emergency_info?.current_medications && (
                                                <p><span className="font-bold text-xs uppercase text-slate-400">Main:</span> {emergencyData.emergency_info.current_medications}</p>
                                            )}
                                            {emergencyData.diagnoses?.filter(d => d.medications).map(d => (
                                                <p key={d.id}><span className="font-bold text-xs uppercase text-slate-400">For {d.disease_name}:</span> {d.medications}</p>
                                            ))}
                                            {(!emergencyData.emergency_info?.current_medications && (!emergencyData.diagnoses || emergencyData.diagnoses.filter(d => d.medications).length === 0)) && (
                                                <p className="italic text-slate-400">No active medications listed.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: Contact & History */}
                            <div className="md:col-span-4 space-y-6">
                                {/* EMERGENCY CONTACT */}
                                <Card className="border-0 shadow-lg overflow-hidden relative">
                                    <div className="absolute inset-0 bg-blue-600 opacity-[0.03] pattern-grid-lg" />
                                    <CardContent className="p-6 space-y-6 relative">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Primary Contact</p>
                                            <p className="text-xl font-black text-slate-900">{emergencyData.emergency_info?.emergency_contact_name || "N/A"}</p>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                {emergencyData.emergency_info?.emergency_contact_relationship || "Contact"}
                                            </Badge>
                                        </div>

                                        <a
                                            href={`tel:${emergencyData.emergency_info?.emergency_contact_phone}`}
                                            className="block"
                                        >
                                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20">
                                                <Phone className="mr-2 h-4 w-4 animate-pulse" /> Call Now
                                            </Button>
                                        </a>
                                        <p className="text-center text-xs text-slate-400 font-medium font-mono">
                                            {emergencyData.emergency_info?.emergency_contact_phone || "No Number"}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* RECENT HISTORY */}
                                <Card className="shadow-lg bg-slate-50 border-0">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Stethoscope className="h-4 w-4" /> Clinical History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {(emergencyData.diagnoses?.length > 0 || emergencyData.lab_results?.length > 0) ? (
                                            <>
                                                {emergencyData.diagnoses?.slice(0, 3).map((d, i) => (
                                                    <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col gap-1 text-sm">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-slate-700">{d.disease_name}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(d.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        {d.medications && (
                                                            <div className="flex items-start gap-1.5 text-[11px] text-rose-600 bg-rose-50/50 p-1.5 rounded-md mt-1 border border-rose-100/30">
                                                                <Pill className="h-3 w-3 mt-0.5 shrink-0" />
                                                                <span className="font-medium tracking-tight">Rx: {d.medications}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {emergencyData.lab_results?.slice(0, 2).map((l, i) => (
                                                    <div key={`lab-${i}`} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center text-sm">
                                                        <span className="font-bold text-slate-700 flex items-center gap-2">
                                                            <Thermometer className="h-3 w-3 text-emerald-500" /> {l.type}
                                                        </span>
                                                        {l.is_abnormal && <Badge variant="destructive" className="h-1.5 w-1.5 p-0 rounded-full" />}
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="py-8 text-center text-slate-400 text-xs italic">
                                                No authorized clinical history available.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Floating Action Button (Mobile Only) */}
                        <div className="fixed bottom-6 right-6 md:hidden z-50">
                            <a href={`tel:${emergencyData.emergency_info?.emergency_contact_phone}`}>
                                <Button size="icon" className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/40 animate-bounce">
                                    <Phone className="h-6 w-6" />
                                </Button>
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
