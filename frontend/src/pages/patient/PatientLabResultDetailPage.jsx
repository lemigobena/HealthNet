import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    FlaskConical,
    Calendar,
    User,
    FileDown,
    Loader2,
    ChevronLeft,
    ClipboardCheck,
    Building2,
    FileText,
    AlertCircle,
    ShieldCheck
} from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"

export default function PatientLabResultDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [labResult, setLabResult] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLabResult = async () => {
            try {
                const response = await api.get(`/patient/lab-results/${id}`)
                setLabResult(response.data.data)
            } catch (err) {
                console.error("Failed to fetch lab result details", err)
                setError("Could not retrieve clinical report. It may have been restricted or archived.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchLabResult()
    }, [id])

    const handleDownload = async () => {
        if (!labResult || isDownloading) return;

        setIsDownloading(true);
        try {
            const response = await api.get(`/patient/lab-results/${id}/download`);
            const { download_url } = response.data.data;

            // Safer download method for many browsers
            const link = document.createElement('a');
            link.href = download_url;
            link.setAttribute('download', labResult.file_name || 'report');
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error("Download failed:", err);
            const errorMsg = err.response?.data?.message || err.message;
            alert(`Download security check failed: ${errorMsg}`);
            // Fallback as last resort
            window.open(labResult.file_url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    }

    if (isLoading) {
        return (
            <PatientLayout title="Clinical Analytics" subtitle="Decrypting laboratory data...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Accessing your health records...</p>
                </div>
            </PatientLayout>
        )
    }

    if (error || !labResult) {
        return (
            <PatientLayout title="Access Error" subtitle="Registry integration failure">
                <div className="max-w-md mx-auto text-center space-y-4 mt-20 p-8 bg-destructive/5 rounded-3xl border-2 border-dashed border-destructive/20">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Report Not Found</h2>
                    <p className="text-muted-foreground">{error || "The requested lab result could not be located in your history."}</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 border-2">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Return to Results
                    </Button>
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout
            title="Laboratory Report Detail"
            subtitle={`Integrated Clinical File: ${labResult.lab_id}`}
        >
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Navigation Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        asChild
                        className="group hover:bg-transparent -ml-4"
                    >
                        <Link to="/patient/lab-results">
                            <ChevronLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                            <span className="font-bold text-lg">Back to Lab Results</span>
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        Verified Clinical Data
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Stats Card */}
                    <Card className="lg:col-span-2 shadow-2xl border-border/50 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-muted/30 border-b p-8">
                            <div className="flex justify-between items-start gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                                            <FlaskConical className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className="border-2 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
                                            {labResult.type?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-4xl font-black tracking-tight leading-tight">
                                        {labResult.test_name || labResult.type?.replace('_', ' ')}
                                    </CardTitle>
                                    <CardDescription className="text-base font-medium">
                                        Detailed diagnostic analysis from your healthcare provider.
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge
                                        className={cn(
                                            "mb-2 uppercase text-[10px] font-black border-none px-5 py-1.5",
                                            !labResult.is_abnormal ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                                        )}
                                    >
                                        {!labResult.is_abnormal ? 'NORMAL' : 'ABNORMAL'}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Result Recorded</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            {/* Findings Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <ClipboardCheck className="h-5 w-5 text-primary" />
                                    <h3 className="font-black uppercase tracking-widest text-xs text-foreground">Test Summary</h3>
                                </div>
                                <div className="p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                                    <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap italic text-foreground/80">
                                        {labResult.result_summary || "No specific analytical findings reported for this test sequence."}
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Findings Section */}
                            {labResult.findings && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b pb-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <h3 className="font-black uppercase tracking-widest text-xs text-foreground">Detailed Findings</h3>
                                    </div>
                                    <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
                                        <p className="font-bold text-muted-foreground whitespace-pre-wrap">
                                            {labResult.findings}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadata Sidebar */}
                    <div className="space-y-6">
                        <Card className="shadow-xl border-border/50 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-primary p-6 text-primary-foreground">
                                <h3 className="font-black uppercase tracking-widest text-xs opacity-80 mb-4">Patient Integrity</h3>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-black text-xl uppercase">
                                        {labResult.patient?.user?.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg leading-none">{labResult.patient?.user?.name}</p>
                                        <p className="text-[10px] uppercase font-bold opacity-70 mt-1">ID: {labResult.patient?.patient_id}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2 mb-3">Biological Profile</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Gender</p>
                                            <p className="font-bold text-sm">{labResult.patient?.user?.gender || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">DOB</p>
                                            <p className="font-bold text-sm">{labResult.patient?.user?.dob ? new Date(labResult.patient.user.dob).toLocaleDateString() : "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Blood Type</p>
                                            <p className="font-bold text-sm">{labResult.patient?.blood_type?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Insurance</p>
                                            <p className="font-bold text-sm text-[10px]">{labResult.patient?.insurance_status || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2 mb-3">Test Metadata</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter">Collection Date</p>
                                                <p className="font-bold text-sm">{dayjs(labResult.test_date).format('MMMM D, YYYY')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter">Reporting Facility</p>
                                                <p className="font-bold text-sm">{labResult.facility?.name || 'Central Diagnostic Registry'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-primary" />
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter">Verified By</p>
                                                <p className="font-bold text-sm text-primary">
                                                    {labResult.doctor?.user?.name ? `Dr. ${labResult.doctor.user.name}` : "System Automated Verification"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Attachment Card */}
                        <Card className="shadow-xl border-border/50 rounded-3xl overflow-hidden border-2 hover:border-primary/30 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="space-y-1">
                                        <h3 className="font-black uppercase tracking-widest text-xs">Attached Record</h3>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase underline">Digital Archive</p>
                                    </div>
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                        <FileDown className="h-5 w-5" />
                                    </div>
                                </div>
                                {labResult.file_url ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted/30 rounded-xl border flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-primary/40" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{labResult.file_name || 'report.pdf'}</p>
                                                <p className="text-[10px] uppercase font-black text-muted-foreground opacity-60">
                                                    PDF ARCHIVE • {((labResult.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        {labResult.file_url.startsWith('http') ? (
                                            <Button
                                                className="w-full h-12 font-black transition-all shadow-lg active:scale-95"
                                                onClick={handleDownload}
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> GENERATING SECURE LINK...</>
                                                ) : (
                                                    'DOWNLOAD'
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold text-center">
                                                Digital Scan Archived (Offline)
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border-2 border-dashed rounded-2xl bg-muted/5">
                                        <p className="text-xs font-bold text-muted-foreground opacity-60 uppercase">No Digital Scan Uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PatientLayout>
    )
}
