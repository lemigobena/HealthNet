import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AllUsersPage() {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || 'ALL';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState(initialRole);
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterRole !== 'ALL') params.role = filterRole;
            if (search) params.search = search;

            const res = await api.get('/super-admin/users', { params });
            // Backend should exclude Super Admin, but filter here just in case
            setUsers(res.data.data.filter(u => u.role !== 'SUPER_ADMIN'));
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const handleSearch = () => {
        fetchUsers();
    };

    const handleSuspend = async (e, userId, currentStatus) => {
        e.stopPropagation(); // Prevent row click
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

    const handleRowClick = (user) => {
        // Navigate to their profile if possible.
        // For now, we don't have a "View User Profile" page for Super Admin that handles all roles perfectly, 
        // but user requested "if a user is clicked it should show their profile".
        // I'll assume I should route to:
        // /super-admin/users/:userId -> but I haven't implemented a generic user profile viewer yet.
        // I only have HospitalProfilePage. I have no generic user profile page.
        // But the user said "the view profile should work for admin and doctor in the super admin dashboard".
        // So I need a page. I'll create a simple one or reuse existing components if any.
        // Actually, for Doctor and Patient, we have views (AdminViewPatientPage etc) but those are for Facility Admins.
        // I should probably make a new generic "UserProfileViewer" or just alert for now if not implemented.
        // NO, user said "should show their profile". I will create a basic Viewer page or Modal.
        // Let's create a Modal or a new Route `/super-admin/users/:id`.
        // I'll add that route in the summary/plan or next step.
        // For now, let's navigate to `/super-admin/users/${user.user_id}`.
        navigate(`/super-admin/users/${user.user_id}`);
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
                                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(user)}>
                                        <TableCell className="font-medium">{user.user_id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {status !== 'N/A' && (
                                                <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}
                                                    className={status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-none' : 'bg-red-100 text-red-800 border-none'}>
                                                    {status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && (
                                                <Button
                                                    variant={status === 'ACTIVE' ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={(e) => handleSuspend(e, user.id, status)}
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
