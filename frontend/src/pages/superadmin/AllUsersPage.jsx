import { useState, useEffect } from 'react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

export default function AllUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('ALL');
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterRole !== 'ALL') params.role = filterRole;
            if (search) params.search = search;

            const res = await api.get('/super-admin/users', { params });
            setUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filterRole]); // Search is manual trigger usually, or debounce. Let's make search trigger on enter or button? Or effect?

    const handleSearch = () => {
        fetchUsers();
    };

    const handleSuspend = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        if (!window.confirm(`Are you sure you want to ${newStatus === 'INACTIVE' ? 'suspend' : 'activate'} this user?`)) return;

        try {
            await api.patch(`/super-admin/users/${userId}/status`, { status: newStatus });
            toast({ title: "Success", description: `User ${newStatus === 'INACTIVE' ? 'suspended' : 'activated'} successfully` });
            fetchUsers();
        } catch (error) {
            toast({ title: "Error", description: error.response?.data?.message || "Action failed", variant: "destructive" });
        }
    };

    const getStatus = (user) => {
        if (user.role === 'DOCTOR') return user.doctor_profile?.status;
        if (user.role === 'PATIENT') return user.patient_profile?.status;
        return 'N/A';
    };

    return (
        <SuperAdminLayout title="All Users" subtitle="Manage users across the system">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                    <Input
                        placeholder="Search by name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} variant="secondary"><Search className="h-4 w-4" /></Button>
                </div>
                <div className="w-full md:w-48">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="DOCTOR">Doctor</SelectItem>
                            <SelectItem value="PATIENT">Patient</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">No users found</TableCell></TableRow>
                        ) : (
                            users.map((user) => {
                                const status = getStatus(user);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.user_id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {status !== 'N/A' && (
                                                <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}
                                                    className={status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && (
                                                <Button
                                                    variant={status === 'ACTIVE' ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => handleSuspend(user.id, status)}
                                                >
                                                    {status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </SuperAdminLayout>
    );
}
