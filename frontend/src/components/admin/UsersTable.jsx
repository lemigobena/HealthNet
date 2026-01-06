import { useState, useEffect } from "react"
import api from "@/services/api"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
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
                name: p.user.name,
                email: p.user.email,
                role: p.user.role,
                status: p.status, // Use status from patient object
                createdAt: p.user.created_at
            }))

            const doctors = doctorsRes.data.data.map(d => ({
                id: d.doctor_id,
                name: d.user.name,
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
        } catch (err) {
            console.error("Failed to toggle status", err)
        }
    }

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.id.toLowerCase().includes(searchQuery.toLowerCase())

        const normalizedRole = roleFilter.toUpperCase()
        const matchesRole = roleFilter === "all" || u.role === normalizedRole || (roleFilter === "lab_technician" && u.role === "LAB_TECH")
        return matchesSearch && matchesRole
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage all registered users in the system</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Administrators</SelectItem>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span>Synchronizing registry...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={roleColors[user.role]}>
                                                {roleLabels[user.role]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === "ACTIVE" || user.status === "active" ? "default" : "secondary"} className="uppercase text-[10px] font-black">
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className={user.status === "ACTIVE" || user.status === "active" ? "text-destructive" : "text-green-600"}
                                                        onClick={() => handleStatusToggle(user)}
                                                    >
                                                        {user.status === "ACTIVE" || user.status === "active" ? (
                                                            <>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground uppercase tracking-widest text-[10px] font-bold italic">
                                        No users matching registry parameters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
