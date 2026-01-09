import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import AdminLayout from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Users, Loader2, Eye, EyeOff } from "lucide-react"
import api from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterPatientPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")


    const [showPassword, setShowPassword] = useState(false)
    const [isOtherDisability, setIsOtherDisability] = useState(false)

    const disabilities = [
        "No disability",
        "Visual Impairment",
        "Hearing Impairment",
        "Physical Disability",
        "Intellectual Disability",
        "Speech Impairment"
    ]

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "DefaultPatient123!",
        gender: "",
        dob: "",
        blood_type: "",
        disability: "No disability",
        insurance_status: "UNINSURED",
        address: "",
        nationality: "Ethiopian",
        place_of_birth: "",
        national_id: ""
    })

    useEffect(() => {
        if (user?.admin_profile?.facility_id) {
            setFormData(prev => ({ ...prev, facility_id: user.admin_profile.facility_id }))
        }
    }, [user])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleDisabilityChange = (val) => {
        if (val === "OTHER") {
            setIsOtherDisability(true)
            setFormData(prev => ({ ...prev, disability: "" }))
        } else {
            setIsOtherDisability(false)
            setFormData(prev => ({ ...prev, disability: val }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await api.post('/admin/patients', formData)
            navigate('/admin/my-patients')
        } catch (err) {
            setError(err.response?.data?.message || "Failed to register patient")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AdminLayout title="Register New Patient" subtitle="Enroll a patient into the HealthNet system">
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
                            <Users className="h-5 w-5 text-primary" />
                            Patient Registration Form
                        </CardTitle>
                        <CardDescription>
                            Fill in all required details to create a new patient record
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Account & Contact Info</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Full Name *</Label>
                                        <Input
                                            placeholder="Enter patient's full name"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address *</Label>
                                        <Input
                                            type="email"
                                            placeholder="patient.name@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number *</Label>
                                        <Input
                                            placeholder="+251 9XX XXX XXX"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Temporary Password *</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a secure password"
                                                value={formData.password}
                                                onChange={(e) => handleChange('password', e.target.value)}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Demographic Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
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
                                        <Label>Blood Type</Label>
                                        <Select value={formData.blood_type} onValueChange={(val) => handleChange('blood_type', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A_POSITIVE">A+</SelectItem>
                                                <SelectItem value="A_NEGATIVE">A-</SelectItem>
                                                <SelectItem value="B_POSITIVE">B+</SelectItem>
                                                <SelectItem value="B_NEGATIVE">B-</SelectItem>
                                                <SelectItem value="O_POSITIVE">O+</SelectItem>
                                                <SelectItem value="O_NEGATIVE">O-</SelectItem>
                                                <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                                                <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Insurance Status</Label>
                                        <Select value={formData.insurance_status} onValueChange={(val) => handleChange('insurance_status', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INSURED">Insured</SelectItem>
                                                <SelectItem value="UNINSURED">Uninsured</SelectItem>
                                                <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nationality</Label>
                                        <Input
                                            placeholder="e.g. Ethiopian"
                                            value={formData.nationality}
                                            onChange={(e) => handleChange('nationality', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Place of Birth</Label>
                                        <Input
                                            placeholder="City / Region of birth"
                                            value={formData.place_of_birth}
                                            onChange={(e) => handleChange('place_of_birth', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>National ID *</Label>
                                        <Input
                                            placeholder="Enter Government ID Number"
                                            value={formData.national_id}
                                            onChange={(e) => handleChange('national_id', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Disability Status</Label>
                                        <Select
                                            value={isOtherDisability ? "OTHER" : formData.disability}
                                            onValueChange={handleDisabilityChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select disability status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {disabilities.map(d => (
                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                ))}
                                                <SelectItem value="OTHER">Other...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {isOtherDisability && (
                                            <Input
                                                className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300"
                                                placeholder="Specify other disability"
                                                value={formData.disability}
                                                onChange={(e) => handleChange('disability', e.target.value)}
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Residential Address *</Label>
                                        <Input
                                            placeholder="Complete residential address"
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            required
                                        />
                                    </div>
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
                                            Enrolling...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Enroll Patient
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
