import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QrCode, Download, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, User, Phone, HeartPulse, History, Eye, Globe, Timer } from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"

export function QRCodeView() {
    const { user } = useAuth()
    const [qrData, setQrData] = useState(null)
    const [scanHistory, setScanHistory] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRegenerating, setIsRegenerating] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [qrRes, historyRes] = await Promise.all([
                api.get('/qr/my-codes'),
                api.get('/qr/scan-history')
            ])
            setQrData(qrRes.data.data[0] || null)
            setScanHistory(historyRes.data.data)
        } catch (err) {
            console.error("Failed to fetch QR data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleRegenerate = async () => {
        setIsRegenerating(true)
        try {
            const response = await api.post('/qr/generate')
            setQrData(response.data.data)
            // Refresh history too in case generation was logged
            const historyRes = await api.get('/qr/scan-history')
            setScanHistory(historyRes.data.data)
        } catch (err) {
            console.error("Failed to regenerate QR", err)
        } finally {
            setIsRegenerating(false)
        }
    }

    const patient = user?.patient_profile
    const patientInfo = {
        name: user?.name || "Registry User",
        upi: patient?.patient_id || "UPI-PENDING",
        bloodType: patient?.blood_type || "N/A",
        lastGenerated: qrData ? dayjs(qrData.created_at).format('MMM D, YYYY') : "N/A",
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <RefreshCw className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Accessing SafePass Registry...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main QR Card */}
                <Card className="lg:col-span-3 border-none shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-card dark:to-card/50 overflow-hidden ring-1 ring-border/50">
                    <CardHeader className="border-b bg-muted/20 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <QrCode className="h-6 w-6 text-primary" />
                                    My SafePass QR Code
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Instant emergency access for authorized medical personnel
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {qrData?.is_active ? "Active & Verified" : "Inactive"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
                            {/* QR Display Section */}
                            <div className="flex flex-col items-center gap-6 shrink-0 lg:w-1/3 lg:border-r lg:pr-10 border-border/50">
                                <div className="relative group">
                                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary to-blue-600 opacity-20 blur group-hover:opacity-40 transition duration-500" />
                                    <div className="relative rounded-[1.8rem] border-4 border-white dark:border-gray-800 bg-white p-6 shadow-2xl">
                                        {qrData?.qr_code_url ? (
                                            <img src={qrData.qr_code_url} alt="SafePass QR" className="h-56 w-56" />
                                        ) : (
                                            <div className="h-56 w-56 bg-muted flex items-center justify-center rounded-xl">
                                                <QrCode className="h-20 w-20 text-muted-foreground opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex w-full flex-col gap-2 sm:flex-row">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                                        onClick={handleRegenerate}
                                        disabled={isRegenerating}
                                    >
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                                        Rotate Token
                                    </Button>
                                    <Button
                                        className="flex-1 h-11 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                        onClick={() => {
                                            if (qrData?.qr_code_url) {
                                                const link = document.createElement('a');
                                                link.href = qrData.qr_code_url;
                                                link.download = `SafePass-${patientInfo.upi}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }
                                        }}
                                        disabled={!qrData?.qr_code_url}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Save Pass
                                    </Button>
                                </div>
                            </div>

                            {/* Patient Info Section */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        Linked Patient Identity
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                                            <p className="text-lg font-bold tracking-tight">{patientInfo.name}</p>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Blood Type</p>
                                            <p className="text-lg font-black tracking-tight text-primary flex items-center gap-2">
                                                {patientInfo.bloodType?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}
                                                <span className="text-[10px] font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">Medically Verify</span>
                                            </p>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 col-span-1 md:col-span-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Unique Patient ID</p>
                                                    <p className="text-base font-mono font-semibold tracking-wide text-foreground">{patientInfo.upi}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Last Rotated</p>
                                                    <p className="text-base font-medium">{patientInfo.lastGenerated}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                                    <ShieldCheck className="h-5 w-5 pt-0.5" />
                                    <div className="ml-2">
                                        <AlertTitle className="font-bold">Security & Privacy Protocol</AlertTitle>
                                        <AlertDescription className="text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed text-xs sm:text-sm">
                                            Your SafePass provides a secure link to your emergency profile. You should rotate your token periodically if you suspect unauthorized access. All scans are logged for your protection.
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scan History Section */}
                <Card className="lg:col-span-3 border-none shadow-xl bg-background overflow-hidden ring-1 ring-border/50">
                    <CardHeader className="border-b bg-muted/5">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">SafePass Scan History</CardTitle>
                        </div>
                        <CardDescription>Audit log of all emergency record access attempts</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {scanHistory.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {scanHistory.map((scan) => (
                                    <div key={scan.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                                <Eye className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Accessed by {scan.scanned_by?.name || "First Responder"}</p>
                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                                                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {scan.ip_address}</span>
                                                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {dayjs(scan.scanned_at).format('MMM D, YYYY HH:mm')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-green-50 text-green-600 border-green-200">
                                            VERIFIED
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center space-y-3">
                                <ShieldCheck className="h-12 w-12 text-muted-foreground opacity-20 mx-auto" />
                                <p className="text-muted-foreground font-medium">No record access history found.</p>
                                <p className="text-xs text-muted-foreground/60">Registry security is currently active with zero unauthorized attempts.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
