import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FlaskConical, Calendar, User, FileDown, Loader2 } from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"

export default function DoctorMyLabResultsPage() {
    const [labResults, setLabResults] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLabResults = async () => {
            try {
                const response = await api.get('/doctor/lab-results')
                setLabResults(response.data.data)
            } catch (err) {
                console.error("Failed to fetch lab results", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLabResults()
    }, [])

    const handleDownload = (fileUrl, fileName) => {
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `https://backend-jgdk.onrender.com${fileUrl}`;
        window.open(fullUrl, '_blank');
    }

    if (isLoading) {
        return (
            <DoctorLayout title="Laboratory Archives" subtitle="Syncing lab data...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Accessing clinical database...</p>
                </div>
            </DoctorLayout>
        )
    }

    return (
        <DoctorLayout
            title="My Laboratory Results"
            subtitle="Verified reports and uploads from your clinical sessions"
        >
            <div className="max-w-6xl mx-auto space-y-4">
                {labResults.length > 0 ? (
                    labResults.map((result) => (
                        <Link key={result.lab_id} to={`/doctor/lab-results/${result.lab_id}`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
                            <Card className="transition-all hover:shadow-xl border-border/50 group overflow-hidden">
                                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex gap-4 items-center flex-1">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-primary/10">
                                            <FlaskConical className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-xl group-hover:text-primary transition-colors tracking-tight">
                                                {result.test_name || result.type}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {result.patient?.user?.name}</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {dayjs(result.test_date).format('MMM D, YYYY')}</span>
                                                <span className="text-primary/60 font-black">ID: {result.lab_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                                        <div className="text-right">
                                            <Badge
                                                className={cn(
                                                    "mb-2 uppercase text-[10px] font-black border-none px-4 py-1",
                                                    !result.is_abnormal ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                                                )}
                                            >
                                                {result.is_abnormal ? 'ABNORMAL' : 'NORMAL'}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                                Verified Archive
                                            </p>
                                        </div>
                                        {result.file_url && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-14 w-14 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all shadow-lg"
                                                asChild
                                            >
                                                <a href={result.file_url.startsWith('http') ? result.file_url : `https://backend-jgdk.onrender.com${result.file_url}`} target="_blank" rel="noopener noreferrer" download={result.file_name || 'report'}>
                                                    <FileDown className="h-6 w-6" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center p-20 bg-muted/10 border-2 border-dashed rounded-3xl border-border/50">
                        <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-10 text-primary" />
                        <p className="text-xl font-bold text-foreground">No Laboratory Submissions</p>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Your clinical record is currently empty. Uploaded test results will be archived here.</p>
                    </div>
                )}
            </div>
        </DoctorLayout>
    )
}
