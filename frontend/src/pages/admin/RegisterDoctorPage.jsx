import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import AdminLayout from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Stethoscope, Loader2 } from "lucide-react"
import api from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterDoctorPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [facilities, setFacilities] = useState([])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "DefaultPassword123!", // Recommended to have a default or field
        gender: "",
        dob: "",
        license_number: "",
        type: "",
        specialization: "",
        facility_id: "",
        address: "",
        nationality: "Ethiopian",
        place_of_birth: "",
        national_id: ""
    })

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                // In a real app, we'd have an endpoint for this
                // For now, let's assume we can fetch or use the one from admin profile
                const response = await api.get('/admin/facilities')
                setFacilities(response.data.data)

                // Autofill facility if admin belongs to one
                if (user?.admin_profile?.facility_id) {
                    setFormData(prev => ({ ...prev, facility_id: user.admin_profile.facility_id }))
                }
            } catch (err) {
                console.error("Failed to fetch facilities", err)
            }
        }
        fetchFacilities()
    }, [user])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await api.post('/admin/doctors', formData)
            navigate('/admin/my-doctors')
        } catch (err) {
            setError(err.response?.data?.message || "Failed to register doctor")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AdminLayout title="Register New Doctor" subtitle="Add a medical professional to HealthNet">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                    <Link to="/admin/register">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Register Options
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            Doctor Registration Form
                        </CardTitle>
                        <CardDescription>
                            Fill in all required details to create a new doctor account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address *</Label>
                                    <Input
                                        type="email"
                                        placeholder="doctor@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number *</Label>
                                    <Input
                                        placeholder="+251 91 123 4567"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>National ID *</Label>
                                    <Input
                                        placeholder="Enter National ID"
                                        value={formData.national_id}
                                        onChange={(e) => handleChange('national_id', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Temporary Password *</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Professional Info */}
                                <div className="space-y-2">
                                    <Label>Doctor Type *</Label>
                                    <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEDICAL_DOCTOR">Medical Doctor</SelectItem>
                                            <SelectItem value="LAB_TECHNICIAN">Lab Technician</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Specialization *</Label>
                                    <Input
                                        placeholder="e.g. Cardiology"
                                        value={formData.specialization}
                                        onChange={(e) => handleChange('specialization', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Medical License Number *</Label>
                                    <Input
                                        placeholder="Enter license number"
                                        value={formData.license_number}
                                        onChange={(e) => handleChange('license_number', e.target.value)}
                                        required
                                    />
                                </div>


                                {/* Demographic Info */}
                                <div className="space-y-2">
                                    <Label>Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(val) => handleChange('gender', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth *</Label>
                                    <Input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleChange('dob', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nationality</Label>
                                    <Input
                                        value={formData.nationality}
                                        onChange={(e) => handleChange('nationality', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Place of Birth</Label>
                                    <Input
                                        placeholder="City / Region"
                                        value={formData.place_of_birth}
                                        onChange={(e) => handleChange('place_of_birth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Residential Address</Label>
                                    <Input
                                        placeholder="Enter full address"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" asChild disabled={isLoading}>
                                    <Link to="/admin/register">Cancel</Link>
                                </Button>
                                <Button size="lg" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Register Doctor
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
