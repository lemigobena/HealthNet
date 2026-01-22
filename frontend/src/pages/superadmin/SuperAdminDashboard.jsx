import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Stethoscope, Users, UserCheck, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        hospitals: 0,
        doctors: 0,
        patients: 0,
        admins: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats
                const statRes = await api.get('/super-admin/dashboard/stats');
                setStats(statRes.data.data);

                // Fetch recent users (reusing getAllUsers with limit if backend supported, but for now just slice)
                // We'll ask to get all users and take top 5 for demo "Recent Activity"
                const userRes = await api.get('/super-admin/users');
                // Backend returns sorted by created_at desc
                setRecentUsers(userRes.data.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: "Total Hospitals", value: stats.hospitals, icon: Building2, color: "text-blue-600", bg: "bg-blue-100", link: "/super-admin/hospitals" },
        { title: "Total Doctors", value: stats.doctors, icon: Stethoscope, color: "text-green-600", bg: "bg-green-100", link: "/super-admin/users?role=DOCTOR" },
        { title: "Total Patients", value: stats.patients, icon: Users, color: "text-purple-600", bg: "bg-purple-100", link: "/super-admin/users?role=PATIENT" },
        { title: "Total Admins", value: stats.admins, icon: UserCheck, color: "text-orange-600", bg: "bg-orange-100", link: "/super-admin/users?role=ADMIN" },
    ];

    if (loading) return <div>Loading...</div>;

    const handleCardClick = (link) => {
        if (link) navigate(link);
    };

    return (
        <SuperAdminLayout title="Dashboard" subtitle="System Overview and Activity">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((stat, index) => (
                    <Card
                        key={index}
                        className="border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: stat.color.split('-')[1] }}
                        onClick={() => handleCardClick(stat.link)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity / Users */}
            <Card className="col-span-4">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-500" />
                        <CardTitle>Recent User Registrations</CardTitle>
                    </div>
                    <CardDescription>Latest users added to the HealthNet system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Date Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            user.role === 'DOCTOR' ? 'border-green-500 text-green-600' :
                                                user.role === 'PATIENT' ? 'border-purple-500 text-purple-600' :
                                                    'border-orange-500 text-orange-600'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
