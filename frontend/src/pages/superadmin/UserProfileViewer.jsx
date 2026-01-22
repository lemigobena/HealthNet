import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, Hash } from "lucide-react";

export default function UserProfileViewer() {
    const { id } = useParams(); // user_id string
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // I need an endpoint to get a user by ID. 
                // Currently `getAllUsers` supports filtering but not getById.
                // But wait, the admin service has getPatientById etc.
                // Super Admin service doesn't have a generic `getUserById` endpoint yet.
                // I will add one quickly or filter from list (inefficient).
                // Better: Reuse `getAllUsers` with search? No, unsafe.
                // I should add `getUserById` to superadmin service/controller/route. 
                // For now, I'll try to use the list endpoint and filter client side if list is small, OR assume I added the endpoint.
                // I will Add the endpoint in the next step to be robust. 
                // For now, let's write the frontend expecting `/super-admin/users/:id` API to exist.

                // Oops, I didn't add it to the backend yet. 
                // I will pause this file creation? No, I'll write it and then implement backend.
                const res = await api.get(`/super-admin/users/${id}`);
                setUser(res.data.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

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
                        <div>
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-2xl">{user.name}</CardTitle>
                                <Badge className={roleColor}>{user.role}</Badge>
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
        </SuperAdminLayout>
    );
}
