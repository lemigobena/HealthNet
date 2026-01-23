import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Phone, Mail, MapPin, Calendar, Hash, Key, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function UserProfileViewer() {
    const { id } = useParams(); // user_id string
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Password Update State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get(`/super-admin/users/${id}`);
                setUser(res.data.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
                toast({ title: "Error", description: "User not found", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setIsUpdating(true);
        setPasswordError("");
        setPasswordSuccess("");

        try {
            await api.patch(`/super-admin/users/${user.user_id}/password`, {
                password: newPassword
            });
            setPasswordSuccess("Password updated successfully");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess("");
            }, 2000);
            toast({ title: "Success", description: "Password updated successfully" });
        } catch (err) {
            console.error(err);
            setPasswordError(err.response?.data?.message || "Failed to update password");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    const roleColor = user.role === 'DOCTOR' ? 'bg-green-100 text-green-800' :
        user.role === 'PATIENT' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800';

    return (
        <SuperAdminLayout title="User Profile" subtitle="Detailed information">
            <div className="max-w-3xl mx-auto">
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center gap-6 pb-6 border-b">
                        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-12 w-12 text-gray-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                                    <Badge className={roleColor}>{user.role}</Badge>
                                </div>
                                {/* Password Update Trigger */}
                                {user.role === 'ADMIN' && (
                                    <Button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Key className="h-4 w-4" /> Reset Password
                                    </Button>
                                )}
                            </div>
                            <CardDescription className="mt-2 text-base flex flex-col gap-1">
                                <span className="flex items-center gap-2"><Hash className="h-4 w-4" /> {user.user_id}</span>
                                <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Phone
                                </div>
                                <div className="text-lg">{user.phone}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Address
                                </div>
                                <div className="text-lg">{user.address || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" /> Gender
                                </div>
                                <div className="text-lg">{user.gender || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Date of Birth
                                </div>
                                <div className="text-lg">{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>

                        {/* Role Specific Details - could be expanded */}
                        {user.doctor_profile && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3">Doctor Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">License</span>
                                        <div className="font-medium">{user.doctor_profile.license_number}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Specialization</span>
                                        <div className="font-medium">{user.doctor_profile.specialization}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user.admin_profile && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3">Facility Admin Details</h3>
                                <div>
                                    <span className="text-sm text-gray-500">Facility ID</span>
                                    <div className="font-medium">{user.admin_profile.facility_id}</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Password Update Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={(open) => {
                setIsPasswordModalOpen(open);
                if (!open) {
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    setPasswordSuccess("");
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Update Password
                        </DialogTitle>
                        <DialogDescription>
                            Enter a new password for {user.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {(passwordError || passwordSuccess) && (
                            <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${passwordError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {passwordError ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                <span>{passwordError || passwordSuccess}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPasswordModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handlePasswordUpdate}
                            disabled={isUpdating || !newPassword}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}
