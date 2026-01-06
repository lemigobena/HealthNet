import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Stethoscope, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/services/api"

const statusColors = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

const typeColors = {
    MEDICAL_DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    LAB_TECHNICIAN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
}

export default function MyDoctorsPage() {
    const [doctors, setDoctors] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/admin/doctors')
                setDoctors(response.data.data)
            } catch (err) {
                console.error("Failed to fetch doctors:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDoctors()
    }, [])

    const filteredDoctors = doctors.filter(
        (doctor) =>
            doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.doctor_id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AdminLayout title="My Doctors" subtitle="All medical professionals in the HealthNet system">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Doctor Registry</CardTitle>
                            <CardDescription>View and manage all registered medical professionals</CardDescription>
                        </div>
                        <Button asChild>
                            <Link to="/admin/register/doctor">
                                <Stethoscope className="mr-2 h-4 w-4" />
                                Register New Doctor
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, ID or specialization..."
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
                                <p className="text-muted-foreground font-medium">Synchronizing doctor registry...</p>
                            </div>
                        ) : filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <Link
                                    key={doctor.id}
                                    to={`/admin/doctors/${doctor.doctor_id}`}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {doctor.user.name.split(' ')[1]?.charAt(0) || doctor.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold group-hover:text-primary transition-colors">{doctor.user.name}</h4>
                                                <Badge variant="secondary" className={statusColors[doctor.status] || "bg-gray-100"}>
                                                    {doctor.status}
                                                </Badge>
                                                <Badge variant="outline" className={typeColors[doctor.type]}>
                                                    {doctor.type === 'MEDICAL_DOCTOR' ? 'Medical Doctor' : 'Lab Technician'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {doctor.specialization} • {doctor.doctor_id} • {doctor.facility?.name || 'Main Hospital'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {doctor.user.email} • {doctor.user.phone} • {doctor.assigned_patients?.length || 0} patients assigned
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
                                {searchQuery ? "No doctors found matching your search." : "No doctors found in the system."}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
