import { useState, useEffect } from "react"
import api from "@/services/api"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, UserCog, Trash2, Eye } from "lucide-react"

const roleLabels = {
    admin: "Admin",
    doctor: "Doctor",
    patient: "Patient",
    lab_technician: "Lab Tech",
    ADMIN: "Admin",
    DOCTOR: "Doctor",
    PATIENT: "Patient",
    LAB_TECH: "Lab Tech"
}

const roleColors = {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    doctor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    patient: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    lab_technician: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    PATIENT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    LAB_TECH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
}

import { formatName } from "@/utils/nameUtils"

// ... imports remain the same

// ... roleLabels and roleColors remain the same

export function UsersTable() {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                api.get('/admin/patients'),
                api.get('/admin/doctors')
            ])

            const patients = patientsRes.data.data.map(p => ({
                id: p.patient_id,
                name: formatName(p.user),
                email: p.user.email,
                role: p.user.role,
                status: p.status, // Use status from patient object
                createdAt: p.user.created_at
            }))

            const doctors = doctorsRes.data.data.map(d => ({
                id: d.doctor_id,
                name: formatName({ ...d.user, doctor_profile: { type: d.type } }),
                email: d.user.email,
                role: d.user.role,
                status: d.status, // Use status from doctor object
                createdAt: d.user.created_at
            }))

            setUsers([...patients, ...doctors])
        } catch (err) {
            console.error("Failed to fetch users", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleStatusToggle = async (user) => {
        const newStatus = (user.status === "ACTIVE" || user.status === "active") ? "INACTIVE" : "ACTIVE"
        try {
            const endpoint = (user.role === "PATIENT")
                ? `/admin/patients/${user.id}/status`
                : `/admin/doctors/${user.id}/status`

            await api.patch(endpoint, { status: newStatus })
            fetchUsers() // Refresh list
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase()
        return matchesSearch && matchesRole
    })

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="doctor">Doctors</SelectItem>
                        <SelectItem value="patient">Patients</SelectItem>
                        <SelectItem value="lab_technician">Lab Technicians</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium flex items-center gap-2">
                                            {user.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${roleColors[user.role]} border-0`}>
                                        {roleLabels[user.role]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={user.status === "ACTIVE" ? "default" : "secondary"}
                                        className={user.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleStatusToggle(user)}>
                                                {user.status === "ACTIVE" ? "Suspend User" : "Activate User"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
