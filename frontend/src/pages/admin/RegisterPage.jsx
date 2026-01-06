import AdminLayout from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { UserPlus, Users, Stethoscope, ArrowRight } from "lucide-react"

export default function RegisterPage() {
    return (
        <AdminLayout title="Register New User" subtitle="Add doctors or patients to the HealthNet system">
            <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Register Doctor Card */}
                    <Link to="/admin/register/doctor">
                        <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 group">
                            <CardHeader className="pb-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Stethoscope className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-2xl">Register Doctor</CardTitle>
                                <CardDescription className="text-base">
                                    Add a new medical professional to the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>• Medical Doctors (Diagnosis & Treatment)</p>
                                    <p>• Lab Technicians (Lab Results)</p>
                                    <p>• Assign specializations and credentials</p>
                                </div>
                                <div className="flex items-center gap-2 text-primary font-semibold pt-2 group-hover:gap-4 transition-all">
                                    <span>Start Registration</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Register Patient Card */}
                    <Link to="/admin/register/patient">
                        <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 group">
                            <CardHeader className="pb-4">
                                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                                    <Users className="h-8 w-8" />
                                </div>
                                <CardTitle className="text-2xl">Register Patient</CardTitle>
                                <CardDescription className="text-base">
                                    Enroll a new patient into the national health network
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>• Generate Unique Patient ID (UPI)</p>
                                    <p>• Capture emergency information</p>
                                    <p>• Set up medical records access</p>
                                </div>
                                <div className="flex items-center gap-2 text-primary font-semibold pt-2 group-hover:gap-4 transition-all">
                                    <span>Start Registration</span>
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    )
}
