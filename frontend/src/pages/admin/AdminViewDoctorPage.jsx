import { useState, useEffect } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Award, Building2, Calendar, FileText, Fingerprint, GraduationCap } from "lucide-react"
import api from "@/services/api"
import dayjs from "dayjs"
import { Loader2, Key, ShieldCheck, AlertCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdminViewDoctorPage() {
    const { id } = useParams()
    const [doctor, setDoctor] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")

    // Facility change states
    const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false)
    const [facilities, setFacilities] = useState([])
    const [selectedFacility, setSelectedFacility] = useState("")
    const [isFacilityUpdating, setIsFacilityUpdating] = useState(false)
    const [facilityError, setFacilityError] = useState("")
    const [facilitySuccess, setFacilitySuccess] = useState("")

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await api.get(`/admin/doctors/${id}`)
                setDoctor(response.data.data)
            } catch (err) {
                console.error("Failed to fetch doctor:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDoctor()
    }, [id])

    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        setIsUpdating(true)
        setPasswordError("")
        setPasswordSuccess("")

        try {
            await api.patch(`/admin/doctors/${doctor.doctor_id}/password`, {
                password: newPassword
            })
            setPasswordSuccess("Password updated successfully")
            setNewPassword("")
            setConfirmPassword("")
            setTimeout(() => {
                setIsPasswordModalOpen(false)
                setPasswordSuccess("")
            }, 2000)
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Failed to update password")
        } finally {
            setIsUpdating(false)
        }
    }

    // Fetch facilities when facility modal opens
    useEffect(() => {
        const fetchFacilities = async () => {
            if (isFacilityModalOpen) {
                try {
                    const response = await api.get('/facilities')
                    setFacilities(response.data.data)
                    setSelectedFacility(doctor?.facility_id || "")
                } catch (err) {
                    console.error("Failed to fetch facilities:", err)
                    setFacilityError("Failed to load facilities")
                }
            }
        }
        fetchFacilities()
    }, [isFacilityModalOpen, doctor])

    const handleFacilityUpdate = async () => {
        if (!selectedFacility) {
            setFacilityError("Please select a facility")
            return
        }

        setIsFacilityUpdating(true)
        setFacilityError("")
        setFacilitySuccess("")

        try {
            await api.patch(`/admin/doctors/${doctor.doctor_id}/facility`, {
                facility_id: selectedFacility
            })
            setFacilitySuccess("Facility updated successfully")

            // Refresh doctor data
            const response = await api.get(`/admin/doctors/${id}`)
            setDoctor(response.data.data)

            setTimeout(() => {
                setIsFacilityModalOpen(false)
                setFacilitySuccess("")
            }, 2000)
        } catch (err) {
            setFacilityError(err.response?.data?.message || "Failed to update facility")
        } finally {
            setIsFacilityUpdating(false)
        }
    }

    if (isLoading) {
        return (
            <AdminLayout title="Practitioner Profile" subtitle="Accessing Registry...">
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Synchronizing medical credentials...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!doctor) {
        return (
            <AdminLayout title="Error" subtitle="Practitioner Not Found">
                <div className="text-center p-20">
                    <p className="text-xl font-bold">Doctor Not Found</p>
                    <p className="text-muted-foreground">The requested practitioner record could not be found in the HealthNet registry.</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Practitioner Professional Profile"
            subtitle={`Administrative view for ${doctor.user.name}`}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="overflow-hidden border-border/50 shadow-xl">
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
                    <CardContent className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-3xl bg-background border-4 border-background shadow-2xl flex items-center justify-center text-primary text-4xl font-black">
                                {doctor.user.name?.[0]}
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-3xl font-black tracking-tight">{doctor.user.name}</h2>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            variant="outline"
                                            size="sm"
                                            className="font-bold border-2 gap-2 h-10 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                                        >
                                            <Key className="h-4 w-4" />
                                            Update Password
                                        </Button>
                                        <Button
                                            onClick={() => setIsFacilityModalOpen(true)}
                                            variant="outline"
                                            size="sm"
                                            className="font-bold border-2 gap-2 h-10 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                                        >
                                            <Building2 className="h-4 w-4" />
                                            Change Facility
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        {doctor.specialization}
                                    </Badge>
                                    <Badge className="bg-green-500/10 text-green-600 border-none font-bold uppercase tracking-widest text-[10px] px-3">
                                        Certified Practitioner
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
                                    <Fingerprint className="h-3 w-3" /> Practitioner ID
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
                            <CardTitle className="text-xl font-bold tracking-tight">Personal & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</p>
                                    <p className="font-bold">{doctor.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</p>
                                    <p className="font-bold">{doctor.user.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Work Office</p>
                                    <p className="font-bold">{doctor.user.address || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold tracking-tight">Professional Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Specialization Area</p>
                                    <p className="font-bold">{doctor.specialization}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30">
                                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Member Since</p>
                                    <p className="font-bold">{dayjs(doctor.user.created_at).format('MMMM D, YYYY')}</p>
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

                {/* Password Update Modal */}
                <Dialog open={isPasswordModalOpen} onOpenChange={(open) => {
                    setIsPasswordModalOpen(open)
                    if (!open) {
                        setNewPassword("")
                        setConfirmPassword("")
                        setPasswordError("")
                        setPasswordSuccess("")
                    }
                }}>
                    <DialogContent className="sm:max-w-md border-2">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Professional Credentials
                            </DialogTitle>
                            <DialogDescription className="font-bold">
                                Update the clinical access password for {doctor.user.name}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {(passwordError || passwordSuccess) && (
                                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${passwordError ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600'
                                    }`}>
                                    {passwordError ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                    <span className="text-sm font-bold">{passwordError || passwordSuccess}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">New Secure Password</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 border-2 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Confirm New Password</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-12 border-2 rounded-xl"
                                />
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="font-bold uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handlePasswordUpdate}
                                disabled={isUpdating || !newPassword}
                                className="font-black uppercase tracking-widest text-[10px] min-w-[140px]"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Credentials"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Facility Change Modal */}
                <Dialog open={isFacilityModalOpen} onOpenChange={(open) => {
                    setIsFacilityModalOpen(open)
                    if (!open) {
                        setSelectedFacility("")
                        setFacilityError("")
                        setFacilitySuccess("")
                    }
                }}>
                    <DialogContent className="sm:max-w-md border-2">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
                                <Building2 className="h-6 w-6 text-primary" />
                                Change Facility Assignment
                            </DialogTitle>
                            <DialogDescription className="font-bold">
                                Update the facility where {doctor.user.name} is assigned to work
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {(facilityError || facilitySuccess) && (
                                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${facilityError ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600'
                                    }`}>
                                    {facilityError ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                    <span className="text-sm font-bold">{facilityError || facilitySuccess}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">Current Facility</Label>
                                <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                                    <p className="font-bold">{doctor.facility?.name || "Not Assigned"}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-black text-muted-foreground">New Facility</Label>
                                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                                    <SelectTrigger className="h-12 border-2 rounded-xl">
                                        <SelectValue placeholder="Select a facility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facilities.map((facility) => (
                                            <SelectItem key={facility.hospital_id} value={facility.hospital_id}>
                                                {facility.name} - {facility.city_town}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFacilityModalOpen(false)}
                                className="font-bold uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleFacilityUpdate}
                                disabled={isFacilityUpdating || !selectedFacility}
                                className="font-black uppercase tracking-widest text-[10px] min-w-[140px]"
                            >
                                {isFacilityUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Facility"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
