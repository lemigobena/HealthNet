import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, UserCheck, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/services/api"

const statusColors = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

export default function MyPatientsPage() {
    const [patients, setPatients] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/admin/patients')
                setPatients(response.data.data)
            } catch (err) {
                console.error("Failed to fetch patients:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPatients()
    }, [])

    const calculateAge = (dob) => {
        if (!dob) return "N/A"
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const filteredPatients = patients.filter(
        (patient) =>
            patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AdminLayout title="My Patients" subtitle="All patients registered in the HealthNet system">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Patient Registry</CardTitle>
                            <CardDescription>View and manage all registered patients</CardDescription>
                        </div>
                        <Button asChild>
                            <Link to="/admin/register/patient">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Register New Patient
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search patients by name or UPI..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground font-medium">Synchronizing patient records...</p>
                            </div>
                        ) : filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <Link
                                    key={patient.id}
                                    to={`/admin/patients/${patient.patient_id}`}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {patient.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold group-hover:text-primary transition-colors">{patient.user.name}</h4>
                                                <Badge variant="secondary" className={statusColors[patient.status] || "bg-gray-100"}>
                                                    {patient.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {patient.patient_id} • {calculateAge(patient.user.dob)} yrs • {patient.user.gender} • Blood: {patient.blood_type || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Registered: {new Date(patient.user.created_at).toLocaleDateString()} • {patient.assignments?.length || 0} assignments
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                {searchQuery ? "No patients found matching your search." : "No patients found in the system."}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
