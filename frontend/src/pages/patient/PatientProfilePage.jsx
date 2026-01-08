
import { useState, useEffect } from "react"
import PatientLayout from "@/layouts/PatientLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, Save, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/services/api"

export default function PatientProfilePage() {
    const { user, setUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        nationalId: ""
    })

    useEffect(() => {
        if (user) {
            const names = user.name?.split(' ') || []
            setFormData({
                firstName: names[0] || "",
                lastName: names.slice(1).join(' ') || "",
                email: user.email || "",
                phone: user.phone || "Not Set",
                address: user.address || "Not Set",
                dateOfBirth: user.patient_profile?.dob ? new Date(user.patient_profile.dob).toLocaleDateString() : "Not Set",
                nationalId: user.patient_profile?.upi || user.patient_profile?.patient_id || "N/A"
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        try {
            await api.patch('/patient/profile', {
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            })
            const updatedUser = {
                ...user,
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setIsEditing(false)
        } catch (err) {
            console.error("Failed to save profile", err)
        }
    }

    return (
        <PatientLayout title="My Profile" subtitle="Manage your personal information and account settings">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="flex items-center gap-6 p-6 bg-card rounded-xl border shadow-sm">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border-4 border-white dark:border-card shadow-lg">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
                        <p className="text-muted-foreground">{formData.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Shield className="h-3 w-3" /> Verified Patient
                            </span>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "secondary" : "default"}>
                            {isEditing ? "Cancel Editing" : "Edit Profile"}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Your core identity details registered with the National Health Network.
                            Some fields cannot be changed online for security reasons.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        className="pl-9"
                                        disabled // Locked
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        className="pl-9"
                                        disabled // Locked
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-9"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-9"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Residential Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="pl-9"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    value={formData.dateOfBirth}
                                    disabled
                                    className="bg-muted/10 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nid">National Health ID</Label>
                                <Input
                                    id="nid"
                                    value={formData.nationalId}
                                    disabled
                                    className="bg-muted/10 font-mono"
                                />
                            </div>
                        </div>
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="flex justify-end border-t pt-6 bg-muted/5">
                            <Button size="lg" className="min-w-[150px]" onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const newPass = e.target.newPassword.value
                            if (newPass) {
                                try {
                                    await api.patch('/auth/update-password', { password: newPass })
                                    alert("Password updated successfully. You may be asked to login again.")
                                    e.target.reset()
                                } catch (err) {
                                    console.error(err)
                                    alert("Failed to update password")
                                }
                            }
                        }} className="grid gap-4 md:grid-cols-2 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" type="password" placeholder="Enter new password" required />
                            </div>
                            <Button type="submit">Update Password</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PatientLayout>
    )
}

