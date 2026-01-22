import { useState, useEffect } from 'react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";

export default function SuperAdminAuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/super-admin/audit-logs');
                setLogs(res.data.data);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
        if (action.includes('DELETE') || action.includes('SUSPEND')) return 'bg-red-100 text-red-800';
        if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <SuperAdminLayout title="Audit Logs" subtitle="System-wide activity log">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <CardTitle>Recent System Actions</CardTitle>
                    </div>
                    <CardDescription>Track all critical actions performed by admins and system users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">No logs found</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-gray-600">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{log.user?.name || 'System'}</div>
                                            <div className="text-xs text-gray-500">{log.user?.role}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border-0 ${getActionColor(log.action_type)}`}>
                                                {log.action_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{log.entity_type} {log.entity_id}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate" title={log.description}>
                                            {log.description}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </SuperAdminLayout>
    );
}
