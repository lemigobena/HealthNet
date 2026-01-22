import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, MapPin, Phone, Mail, Building, Activity, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function HospitalProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [labResults, setLabResults] = useState([]);
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

    const fetchHospitalData = async () => {
        try {
            // Get basic details
            const res = await api.get(`/super-admin/facilities/${id}`);
            setHospital(res.data.data);

            // Parallel fetch other data
            const [docRes, diagRes, labRes] = await Promise.all([
                api.get(`/super-admin/facilities/${id}/doctors`),
                api.get(`/super-admin/facilities/${id}/diagnoses`),
                api.get(`/super-admin/facilities/${id}/lab-results`)
            ]);

            setDoctors(docRes.data.data);
            setDiagnoses(diagRes.data.data);
            setLabResults(labRes.data.data);

        } catch (error) {
            console.error("Failed to fetch hospital data", error);
            toast({ title: "Error", description: "Failed to load facility details", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitalData();
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
            fetchHospitalData(); // Refresh list to show new admin
        } catch (error) {
            console.error(error);
            // The "red box" error mentioned by user is likely caught here.
            toast({ title: "Error", description: error.response?.data?.message || "Failed to create admin", variant: "destructive" });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!hospital) return <div>Facility not found</div>;

    return (
        <SuperAdminLayout title={hospital.name} subtitle={`Facility ID: ${hospital.hospital_id} • ${hospital.type}`}>

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 rounded-lg mb-6 flex items-center px-8 text-white shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold">{hospital.name}</h1>
                    <p className="opacity-90">{hospital.city_town}</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="bg-muted w-full justify-start h-auto p-1">
                    <TabsTrigger value="profile" className="px-6 py-2">Profile</TabsTrigger>
                    <TabsTrigger value="admins" className="px-6 py-2">Admins</TabsTrigger>
                    <TabsTrigger value="doctors" className="px-6 py-2">Doctors</TabsTrigger>
                    <TabsTrigger value="diagnoses" className="px-6 py-2">Diagnoses</TabsTrigger>
                    <TabsTrigger value="labs" className="px-6 py-2">Lab Results</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/10">
                                    <div className="p-3 bg-blue-100 rounded-full"><Building className="h-6 w-6 text-blue-600" /></div>
                                    <div>
                                        <div className="text-sm text-gray-500">Facility Type</div>
                                        <div className="font-medium">{hospital.type}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/10">
                                    <div className="p-3 bg-green-100 rounded-full"><MapPin className="h-6 w-6 text-green-600" /></div>
                                    <div>
                                        <div className="text-sm text-gray-500">Address</div>
                                        <div className="font-medium">{hospital.address}, {hospital.city_town}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/10">
                                    <div className="p-3 bg-purple-100 rounded-full"><Phone className="h-6 w-6 text-purple-600" /></div>
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <div className="font-medium">{hospital.phone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/10">
                                    <div className="p-3 bg-orange-100 rounded-full"><Mail className="h-6 w-6 text-orange-600" /></div>
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="font-medium">{hospital.email || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="admins">
                    <div className="mb-4 flex justify-end">
                        <Dialog open={openAdminDialog} onOpenChange={setOpenAdminDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700">Create Admin</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Register New Facility Admin</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAdminSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} requiredplaceholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required placeholder="admin@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} required placeholder="+123..." />
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
                                        <Input value={adminForm.address} onChange={e => setAdminForm({ ...adminForm, address: e.target.value })} required placeholder="123 Street" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} required />
                                    </div>
                                    <Button type="submit" className="w-full">Create Admin</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {hospital.admins && hospital.admins.length > 0 ? (
                            hospital.admins.map((admin) => (
                                <Card key={admin.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/super-admin/users/${admin.user_id}`)}>
                                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{admin.user.name}</CardTitle>
                                            <CardDescription>{admin.admin_id}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="text-sm text-gray-500 space-y-1">
                                            <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {admin.user.email}</div>
                                            <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {admin.user.phone}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">No admins found. Create one to get started.</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="doctors">
                    <Card>
                        <CardHeader><CardTitle>Registered Doctors</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {doctors.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">No doctors found</TableCell></TableRow> :
                                        doctors.map(doc => (
                                            <TableRow key={doc.doctor_id}>
                                                <TableCell>{doc.user.name}</TableCell>
                                                <TableCell>{doc.user.email}</TableCell>
                                                <TableCell>{doc.user.phone}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="diagnoses">
                    <Card>
                        <CardHeader><CardTitle>Recent Diagnoses</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Patient</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {diagnoses.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">No diagnoses records</TableCell></TableRow> :
                                        diagnoses.map(d => (
                                            <TableRow key={d.id}>
                                                <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>{d.doctor.user.name}</TableCell>
                                                <TableCell>{d.patient.user.name}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="labs">
                    <Card>
                        <CardHeader><CardTitle>Lab Results</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {labResults.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No lab results found</TableCell></TableRow> :
                                        labResults.map(lab => (
                                            <TableRow key={lab.id}>
                                                <TableCell>{new Date(lab.uploaded_at).toLocaleDateString()}</TableCell>
                                                <TableCell>Lab Report</TableCell> {/* Field might be missing in fetch, adjust if needed */}
                                                <TableCell>{lab.patient.user.name}</TableCell>
                                                <TableCell>{lab.doctor.user.name}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </SuperAdminLayout>
    );
}
