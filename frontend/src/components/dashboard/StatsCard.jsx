
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    Users,
    UserPlus,
    Stethoscope,
    FlaskConical,
    Activity,
    Building,
    Calendar,
    FileText,
    AlertCircle,
    ClipboardList,
    Upload,
    AlertTriangle,
    CheckCircle,
    QrCode,
} from "lucide-react"

const iconMap = {
    users: Users,
    "user-plus": UserPlus,
    stethoscope: Stethoscope,
    "flask-conical": FlaskConical,
    activity: Activity,
    building: Building,
    calendar: Calendar,
    "file-text": FileText,
    "alert-circle": AlertCircle,
    "clipboard-list": ClipboardList,
    upload: Upload,
    "alert-triangle": AlertTriangle,
    "check-circle": CheckCircle,
    "qr-code": QrCode,
}

export function StatsCard({ title, value, description, iconName, trend, className }) {
    const Icon = iconMap[iconName] || Activity

    return (
        <Card className={cn("shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={cn("font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
                                {trend.isPositive ? "+" : ""}
                                {trend.value}%
                            </span>
                        )}
                        {trend && description && " "}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
