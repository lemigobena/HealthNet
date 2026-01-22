import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterHospitalPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'HOSPITAL',
        city_town: '',
        phone: '',
        email: '',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/super-admin/facilities', formData);
            toast({ title: "Success", description: "Hospital registered successfully" });
            navigate('/super-admin/hospitals');
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to register hospital",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SuperAdminLayout title="Register Hospital" subtitle="Add a new facility to the system">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Facility Details</CardTitle>
                        <CardDescription>Enter the information for the new hospital or laboratory. ID will be generated automatically.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select name="type" value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HOSPITAL">Hospital</SelectItem>
                                        <SelectItem value="LABORATORY">Laboratory</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Facility Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="St. Mary's Hospital" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city_town">City / Town</Label>
                                    <Input id="city_town" name="city_town" value={formData.city_town} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address</Label>
                                <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Registering...' : 'Register Facility'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
