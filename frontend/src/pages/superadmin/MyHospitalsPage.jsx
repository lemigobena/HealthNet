import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Phone, Building2 } from "lucide-react";

export default function MyHospitalsPage() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const res = await api.get('/super-admin/facilities');
                setHospitals(res.data.data);
            } catch (error) {
                console.error("Failed to fetch hospitals", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <SuperAdminLayout title="My Hospitals" subtitle="Manage all registered facilities">
            <div className="mb-6 flex justify-end">
                <Button onClick={() => navigate('/super-admin/register-hospital')}>
                    <Plus className="mr-2 h-4 w-4" /> Register New Hospital
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hospitals.map((hospital) => (
                    <Card key={hospital.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/super-admin/hospitals/${hospital.hospital_id}`)}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{hospital.name}</CardTitle>
                                <CardDescription>{hospital.type}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {hospital.city_town}, {hospital.address}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> {hospital.phone}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-4">
                            <div className="w-full flex justify-between text-xs text-muted-foreground">
                                <span>Admins: {hospital._count?.admins || 0}</span>
                                <span>Doctors: {hospital._count?.doctors || 0}</span>
                                <span>Patients: {hospital._count?.patients || 0}</span>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </SuperAdminLayout>
    );
}
