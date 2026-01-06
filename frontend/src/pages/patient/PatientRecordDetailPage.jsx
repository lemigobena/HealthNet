
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, FileText, AlertCircle, Clock, CheckCircle2, Loader2 } from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"

const statusConfig = {
    active: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
    ongoing: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
    resolved: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
    PENDING: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
    COMPLETED: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
}

export default function PatientRecordDetailPage() {
    const { id } = useParams()
    const [record, setRecord] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await api.get(`/patient/diagnoses/${id}`)
                setRecord(response.data.data)
            } catch (err) {
                console.error("Failed to fetch diagnosis details", err)
                setError("Could not retrieve medical record. It may have been archived.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecord()
    }, [id])

    if (isLoading) {
        return (
            <PatientLayout title="Diagnosis Details" subtitle="Opening clinical file...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Syncing with registry...</p>
                </div>
            </PatientLayout>
        )
    }

    if (error || !record) {
        return (
            <PatientLayout title="Access Error" subtitle="Registry integration failure">
                <div className="max-w-md mx-auto text-center space-y-4 mt-20 p-8 bg-destructive/5 rounded-3xl border-2 border-dashed border-destructive/20">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Record Not Found</h2>
                    <p className="text-muted-foreground">{error || "The medical record could not be located."}</p>
                    <Button asChild variant="outline" className="mt-4 border-2">
                        <Link to="/patient/records">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Records
                        </Link>
                    </Button>
                </div>
            </PatientLayout>
        )
    }

    const doctorName = record.doctor?.user?.name || "Unknown Doctor"
    const facilityName = record.facility?.name || "Tickur Anbessa Hospital"
    const dateStr = dayjs(record.created_at).format('MMM D, YYYY')

    return (
        <PatientLayout title="Diagnosis Details" subtitle={`Record ID: ${record.diagnosis_id}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                    <Link to="/patient/records">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Records
                    </Link>
                </Button>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <Card className="md:col-span-2 shadow-md">
                        <CardHeader className="border-b bg-muted/10 pb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">
                                        {dateStr}
                                    </Badge>
                                    <CardTitle className="text-2xl font-bold tracking-tight">{record.disease_name}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>Triaged by Dr. {doctorName}</span>
                                    </div>
                                </div>
                                <Badge className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusConfig[record.status]?.color || "bg-gray-100"}`}>
                                    {record.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="h-8 w-1 bg-primary rounded-full" />
                                    Clinical Observations
                                </h3>
                                <div className="bg-muted/30 p-4 rounded-lg text-sm leading-relaxed border whitespace-pre-line text-foreground/80">
                                    {record.symptoms}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="h-8 w-1 bg-green-500 rounded-full" />
                                    Treatment Plan & Medications
                                </h3>
                                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg text-sm leading-relaxed border border-green-100 dark:border-green-900/50 whitespace-pre-line font-medium">
                                    {record.medications}
                                </div>
                            </div>

                            {(record.suggestions || record.conclusion) && (
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                        Doctor's Remarks
                                    </h3>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-sm leading-relaxed border border-blue-100 dark:border-blue-900/50">
                                        {record.suggestions && (
                                            <>
                                                <p className="font-bold text-blue-900 dark:text-blue-300 mb-1 uppercase text-[10px] tracking-widest">Suggestions:</p>
                                                <p className="mb-4">{record.suggestions}</p>
                                            </>
                                        )}
                                        {record.conclusion && (
                                            <>
                                                <p className="font-bold text-blue-900 dark:text-blue-300 mb-1 uppercase text-[10px] tracking-widest">Conclusion:</p>
                                                <p>{record.conclusion}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registry Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Reporting Facility</p>
                                    <p className="font-bold text-sm">{facilityName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Event Date</p>
                                    <p className="font-bold text-sm">{dateStr}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Case Identifier</p>
                                    <p className="font-mono text-[10px] font-bold text-primary">{record.diagnosis_id}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {record.emergency_visible && (
                            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 border-2">
                                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                    <p className="font-black text-red-900 dark:text-red-400 uppercase text-xs tracking-widest">Emergency Access Enabled</p>
                                    <p className="text-[10px] font-bold text-red-700/80 dark:text-red-300/80 leading-relaxed uppercase">
                                        This record is synchronized with your SafePass QR for first-responder visibility.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PatientLayout>
    )
}
