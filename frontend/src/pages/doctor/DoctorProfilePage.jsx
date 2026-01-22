import DoctorLayout from "@/layouts/DoctorLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Award, Building2, Calendar, FileText, Fingerprint, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import dayjs from "dayjs"
import api from "@/services/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

import { formatName } from "@/utils/nameUtils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

export default function DoctorProfilePage() {
    const { user } = useAuth()
    const doctor = user?.doctor_profile
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertConfig, setAlertConfig] = useState({ title: "", message: "" })
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const showAlert = (title, message) => {
        setAlertConfig({ title, message })
        setAlertOpen(true)
    }

    if (!doctor) return null

    return (
        <DoctorLayout
            title="Professional Credentials"
            subtitle="National HealthNet Practitioner Registry Profile"
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="overflow-hidden border-border/50 shadow-xl">
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
                    <CardContent className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-3xl bg-background border-4 border-background shadow-2xl flex items-center justify-center text-primary text-4xl font-black">
                                {user.name?.[0]}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h2 className="text-3xl font-black tracking-tight">{formatName(user)}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        {doctor.specialization}
                                    </Badge>
                                    <Badge className="bg-green-500/10 text-green-600 border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        Verified Practitioner
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Award className="h-3 w-3" /> License Number
                                </p>
                                <p className="font-bold text-lg">{doctor.license_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Fingerprint className="h-3 w-3" /> System ID
                                </p>
                                <p className="font-bold text-lg">{doctor.doctor_id}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <Building2 className="h-3 w-3" /> Affiliated Facility
                                </p>
                                <p className="font-bold text-lg">{doctor.facility?.name || "National HealthNet"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">Bio-Data & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</p>
                                    <p className="font-bold">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</p>
                                    <p className="font-bold">{user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Residential Address</p>
                                    <p className="font-bold">{user.address || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">System Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Member Since</p>
                                    <p className="font-bold">{dayjs(user.created_at).format('MMMM D, YYYY')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registry Role</p>
                                    <p className="font-bold uppercase">{doctor.type?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Password Reset Section */}
                <Card className="border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold tracking-tight">Security Settings</CardTitle>
                        <CardDescription>Update your secure access credentials</CardDescription>
                    </CardHeader>
                    <CardContent>

                        // ... inside the component render ...

                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            const oldPass = e.target.oldPassword.value
                            const newPass = e.target.newPassword.value
                            const confirmPass = e.target.confirmPassword.value

                            // 1. Check if fields are empty
                            if (!newPass || !oldPass || !confirmPass) {
                                showAlert("Action Required", "Please provide current, new, and confirmation passwords.")
                                return
                            }

                            // 2. Check Password Length
                            if (newPass.length < 6) {
                                showAlert("Weak Password", "Password must be greater than 6 characters.")
                                return
                            }

                            // 3. Check Complexity (1 Upper, 1 Lower, 1 Number)
                            const hasUpperCase = /[A-Z]/.test(newPass)
                            const hasLowerCase = /[a-z]/.test(newPass)
                            const hasNumber = /[0-9]/.test(newPass)

                            if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                                showAlert("Weak Password", "Password must contain at least one uppercase letter, one lowercase letter, and one number.")
                                return
                            }

                            // 4. Check Match
                            if (newPass !== confirmPass) {
                                showAlert("Mismatch", "New password and confirmation do not match.")
                                return
                            }

                            try {
                                await api.patch('/auth/update-password', { oldPassword: oldPass, password: newPass })
                                showAlert("Success", "Password updated successfully.")
                                e.target.reset()
                                // Reset visibility states
                                setShowOldPassword(false)
                                setShowNewPassword(false)
                                setShowConfirmPassword(false)
                            } catch (err) {
                                showAlert("Error", err.response?.data?.message || "Failed to update password.")
                                console.error(err)
                            }
                        }} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 items-start">
                                <div className="space-y-2">
                                    <Label htmlFor="docOldPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="docOldPassword"
                                            name="oldPassword"
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        >
                                            {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="docNewPassword" title="Enter New Password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="docNewPassword"
                                            name="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-start-2">
                                    <Label htmlFor="docConfirmPassword" title="Confirm New Password">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="docConfirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <Button type="submit" className="md:col-span-2 w-full mt-2">Update Credentials</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{alertConfig.title}</DialogTitle>
                        <DialogDescription>
                            {alertConfig.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setAlertOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DoctorLayout>
    )
}
