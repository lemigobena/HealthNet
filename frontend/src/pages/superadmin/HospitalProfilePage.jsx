import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, MapPin, Phone, Mail, Building } from "lucide-react";

export default function HospitalProfilePage() {
    const { id } = useParams();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [openAdminDialog, setOpenAdminDialog] = useState(false);

    // Create Admin Form State
    const [adminForm, setAdminForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: 'MALE',
        address: ''
    });

    const fetchHospital = async () => {
        try {
            const res = await api.get(`/super-admin/facilities/${id}`);
            setHospital(res.data.data);
        } catch (error) {
            console.error("Failed to fetch hospital", error);
            toast({ title: "Error", description: "Failed to load facility details", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospital();
    }, [id]);

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/super-admin/admins', {
                ...adminForm,
                facility_id: hospital.hospital_id
            });
            toast({ title: "Success", description: "Admin created successfully" });
            setOpenAdminDialog(false);
            setAdminForm({ name: '', email: '', phone: '', password: '', gender: 'MALE', address: '' });
            fetchHospital(); // Refresh list
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to create admin", variant: "destructive" });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!hospital) return <div>Facility not found</div>;

    return (
        <SuperAdminLayout title={hospital.name} subtitle={`Facility ID: ${hospital.hospital_id}`}>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Facility Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Building className="h-5 w-5 text-gray-500" />
                                    <span>Type: {hospital.type}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <span>{hospital.city_town}, {hospital.address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5 text-gray-500" />
                                    <span>{hospital.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                    <span>{hospital.email || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="admins">
                    <div className="mb-4 flex justify-end">
                        <Dialog open={openAdminDialog} onOpenChange={setOpenAdminDialog}>
                            <DialogTrigger asChild>
                                <Button>Create Admin</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Register New Admin</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAdminSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                            value={adminForm.gender} onChange={e => setAdminForm({ ...adminForm, gender: e.target.value })}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Input value={adminForm.address} onChange={e => setAdminForm({ ...adminForm, address: e.target.value })} />
                                    </div>
                                    <Button type="submit" className="w-full">Create Admin</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {hospital.admins && hospital.admins.length > 0 ? (
                            hospital.admins.map((admin) => (
                                <Card key={admin.id}>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{admin.user.name}</CardTitle>
                                            <CardDescription>{admin.admin_id}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-gray-500">
                                            <div>{admin.user.email}</div>
                                            <div>{admin.user.phone}</div>
                                        </div>
                                        <Button className="w-full mt-4" variant="outline" onClick={() => alert("Profile View + Audit Logs to come in separate ticket")}>
                                            View Profile
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-8">No admins registered for this facility.</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </SuperAdminLayout>
    );
}
