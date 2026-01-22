import { useState, useEffect } from 'react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function SuperAdminProfilePage() {
    const [user, setUser] = useState(null);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const { toast } = useToast();

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await api.get('/auth/me'); // Standard auth/me works for all roles
                setUser(res.data.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMe();
    }, []);

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const toggleShow = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }
        if (passwords.password.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }

        try {
            await api.patch('/auth/update-password', {
                oldPassword: passwords.oldPassword,
                password: passwords.password
            });
            toast({ title: "Success", description: "Password updated successfully" });
            setPasswords({ oldPassword: '', password: '', confirmPassword: '' });
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update password", variant: "destructive" });
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <SuperAdminLayout title="My Profile" subtitle="Manage your account settings">
            <div className="max-w-xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Name</Label>
                                <div className="p-2 border rounded-md bg-muted">{user.name}</div>
                            </div>
                            <div>
                                <Label>Role</Label>
                                <div className="p-2 border rounded-md bg-muted">{user.role}</div>
                            </div>
                            <div className="col-span-2">
                                <Label>Email</Label>
                                <div className="p-2 border rounded-md bg-muted">{user.email}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your login password securely.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword.old ? "text" : "password"}
                                        name="oldPassword"
                                        value={passwords.oldPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => toggleShow('old')}
                                    >
                                        {showPassword.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword.new ? "text" : "password"}
                                        name="password"
                                        value={passwords.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => toggleShow('new')}
                                    >
                                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwords.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => toggleShow('confirm')}
                                    >
                                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit">Update Password</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
