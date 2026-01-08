import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, FileText, Stethoscope } from "lucide-react"
import { DiagnosisCard } from "@/components/diagnosis/DiagnosisCard"

export function HealthRecords({ records = [], isLoading = false, emptyMessage = "No medical records found." }) {
    const [statusFilter, setStatusFilter] = useState("all")

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Syncing clinical records...</p>
            </div>
        )
    }

    const filteredRecords = records.filter(r => {
        if (statusFilter === "all") return true
        if (statusFilter === "pending") return r.status === "PENDING"
        if (statusFilter === "completed") return r.status === "COMPLETED"
        return true
    })

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Clinical Documentation History
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                            Chronological record of verified diagnoses, treatments, and clinical observations.
                        </CardDescription>
                    </div>
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                        <TabsList className="grid w-full grid-cols-3 md:w-auto">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900">Pending</TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">Completed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((diagnosis) => (
                            <DiagnosisCard key={diagnosis.diagnosis_id} diagnosis={diagnosis} />
                        ))
                    ) : (
                        <div className="col-span-full p-8 border-2 border-dashed rounded-xl bg-muted/20 text-center">
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
