import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, FileText, Calendar, Loader2 } from "lucide-react"
import api from "@/services/api"


export function PatientsList() {
    const [patients, setPatients] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctor/patients')
                setPatients(response.data.data)
            } catch (err) {
                console.error("Failed to fetch patients", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPatients()
    }, [])

    const filteredPatients = patients.filter(
        (patient) =>
            patient.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.upi?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-2xl font-black">Registry of Care</CardTitle>
                <CardDescription className="font-bold opacity-70">Active patients assigned to your clinical supervision</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="relative max-w-sm group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find patient by name or ID (PT-XXXX)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-11 border-2 focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <Link
                                key={patient.patient_id}
                                to={`/doctor/patients/${patient.patient_id}`}
                                className="group block"
                            >
                                <Card className="h-full border-2 border-transparent transition-all group-hover:border-primary/50 group-hover:shadow-2xl overflow-hidden bg-muted/20">
                                    <CardHeader className="pb-4 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shadow-inner border border-primary/5 group-hover:scale-110 transition-transform">
                                                {patient.user?.name?.charAt(0)}
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[10px] uppercase tracking-tighter">
                                                Active Case
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{patient.user?.name}</h4>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                                REGISTRY ID: {patient.patient_id}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Total Cases</p>
                                                    <p className="text-lg font-black">{patient.caseCount || 0}</p>
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <Eye className="h-4 w-4" />
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2">
                                            {patient.upi || "UPI-PENDING"} • {patient.user?.gender} • BLOOD {patient.blood_type?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') || "--"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="py-20 text-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border/40">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No clinical matches found in your registry</p>
                            <p className="text-sm opacity-60">Try searching with a different term or verify assignments</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
