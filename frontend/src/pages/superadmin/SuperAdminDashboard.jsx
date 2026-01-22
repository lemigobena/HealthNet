import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Stethoscope, Users, UserCheck } from "lucide-react";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        hospitals: 0,
        doctors: 0,
        patients: 0,
        admins: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/super-admin/dashboard/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: "Total Hospitals", value: stats.hospitals, icon: Building2, color: "text-blue-600" },
        { title: "Total Doctors", value: stats.doctors, icon: Stethoscope, color: "text-green-600" },
        { title: "Total Patients", value: stats.patients, icon: Users, color: "text-purple-600" },
        { title: "Total Admins", value: stats.admins, icon: UserCheck, color: "text-orange-600" },
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <SuperAdminLayout title="Dashboard" subtitle="Overview of the HealthNet System">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </SuperAdminLayout>
    );
}
