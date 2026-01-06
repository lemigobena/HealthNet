import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function DiagnosisCard({ diagnosis }) {
    const { user } = useAuth()
    const patientName = diagnosis.patient?.user?.name || "Unknown Patient"
    const dateStr = diagnosis.createdAt ? new Date(diagnosis.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : diagnosis.date || "N/A"

    const detailPath = user?.role === 'PATIENT'
        ? `/patient/records/${diagnosis.diagnosis_id}`
        : `/doctor/diagnoses/${diagnosis.diagnosis_id}`

    return (
        <Link to={detailPath} className="block h-full">
            <div className="border rounded-2xl p-5 bg-card shadow-sm hover:shadow-xl transition-all duration-300 border-border/50 group h-full aspect-square flex flex-col items-center justify-between text-center relative overflow-hidden bg-gradient-to-b from-card to-muted/20">

                {/* Status Indicator */}
                <div className="w-full flex justify-end">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        diagnosis.status === 'COMPLETED' ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                        {diagnosis.status}
                    </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full">
                    {/* Disease Name - Primary Focus */}
                    <h3 className="font-black text-xl md:text-2xl tracking-tight text-primary leading-tight line-clamp-2">
                        {diagnosis.disease_name}
                    </h3>

                    {/* Patient Info */}
                    <p className="font-semibold text-sm text-foreground/80 line-clamp-1 mb-2">
                        {patientName}
                    </p>

                    {/* Clinical Details */}
                    <div className="w-full px-2 space-y-1">
                        {diagnosis.symptoms && (
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                "{diagnosis.symptoms}"
                            </p>
                        )}
                        {diagnosis.medications && (
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary/80">
                                <span>Rx:</span>
                                <span className="line-clamp-1">{diagnosis.medications}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full pt-4 border-t border-border/30 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {dateStr}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-primary transition-colors">
                        {diagnosis.diagnosis_id}
                    </span>
                </div>
            </div>
        </Link>
    )
}

function Badge({ className, children }) {
    return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>{children}</span>
}
