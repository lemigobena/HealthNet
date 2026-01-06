import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Stethoscope, Loader2 } from "lucide-react"
import { DiagnosisCard } from "@/components/diagnosis/DiagnosisCard"

export function HealthRecords({ records = [], isLoading = false, emptyMessage = "No medical records found." }) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Syncing clinical records...</p>
            </div>
        )
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Clinical Documentation History
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            Chronological record of verified diagnoses, treatments, and clinical observations.
                        </CardDescription>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <Badge variant="outline" className="h-8 px-3 gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" /> Active
                        </Badge>
                        <Badge variant="outline" className="h-8 px-3 gap-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500" /> Ongoing
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {records.length > 0 ? (
                        records.map((diagnosis) => (
                            <DiagnosisCard key={diagnosis.diagnosis_id} diagnosis={diagnosis} />
                        ))
                    ) : (
                        <div className="p-8 border-2 border-dashed rounded-xl bg-muted/20 text-center">
                            <p className="text-muted-foreground">{emptyMessage}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20">
                    <div className="text-center space-y-2 max-w-sm">
                        <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="font-medium text-foreground">Registry Continuity</p>
                        <p className="text-sm text-muted-foreground">Digital records represent the unified national health archive. Physical records prior to system deployment may exist at primary facilities.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
