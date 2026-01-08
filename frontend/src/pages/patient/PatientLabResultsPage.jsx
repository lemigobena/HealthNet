import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Download, Calendar, Search, Loader2, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import api from "@/services/api"
import { cn } from "@/utils/cn"

export default function PatientLabResultsPage() {
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const response = await api.get('/patient/lab-results')
                setResults(response.data.data)
            } catch (err) {
                console.error("Failed to fetch lab results", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLabs()
    }, [])

    const filteredResults = results.filter(l =>
        (l.test_name || l.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDownload = (fileUrl, fileName) => {
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `https://backend-jgdk.onrender.com${fileUrl}`;
        const link = document.createElement('a');
        link.href = fullUrl;
        link.setAttribute('download', fileName || 'report');
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (isLoading) {
        return (
            <PatientLayout title="Lab Database" subtitle="Synchronizing your clinical reports...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Accessing health records...</p>
                </div>
            </PatientLayout>
        )
    }

    return (
        <PatientLayout title="Diagnostic Reports" subtitle="View and manage your verified laboratory results from all facilities">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by test name (e.g. CBC, Lipid)..."
                        className="pl-11 h-14 bg-background border-2 shadow-sm rounded-xl focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid gap-4">
                    {filteredResults.length > 0 ? (
                        filteredResults.map((result) => (
                            <Link key={result.lab_id} to={`/patient/lab-results/${result.lab_id}`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
                                <Card className="transition-all hover:shadow-xl border-border/50 group overflow-hidden">
                                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                <FlaskConical className="h-7 w-7" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                    {result.test_name || result.type?.replace('_', ' ')}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                                        {new Date(result.test_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="hidden sm:inline opacity-30">•</span>
                                                    <span>{result.facility?.name || "Facility Portal"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="text-right">
                                                <Badge
                                                    className={cn(
                                                        "mb-2 uppercase tracking-tighter text-[10px] font-black px-3 border-none",
                                                        !result.is_abnormal ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                                                    )}
                                                >
                                                    {!result.is_abnormal ? 'NORMAL' : 'ABNORMAL'}
                                                </Badge>
                                                <p className="font-bold text-xs text-muted-foreground flex items-center justify-end gap-1.5">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", !result.is_abnormal ? 'bg-green-500' : 'bg-destructive')} />
                                                    RESULT
                                                </p>
                                            </div>
                                            {result.file_url && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-12 w-12 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all active:scale-95 shadow-lg"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDownload(result.file_url, result.file_name);
                                                    }}
                                                >
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-2xl border-border/40">
                            <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-bold text-muted-foreground">No Laboratory Assets Found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Refine your search parameters or check back after facility sync.</p>
                        </div>
                    )}
                </div>
            </div>
        </PatientLayout>
    )
}
