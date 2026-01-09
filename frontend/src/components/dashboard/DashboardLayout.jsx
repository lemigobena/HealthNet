import { useState, useEffect } from "react"
import { Bell, Search, Menu, LogOut, LayoutDashboard, Users, FileText, Settings, UserPlus, UserCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { HealthNetLogo } from "@/components/icons"
import { cn } from "@/lib/utils"
import api from "@/services/api"
import { ThemeToggle } from "@/components/ThemeToggle"

export function DashboardHeader({ title, subtitle, onMenuClick, children }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications')
                setNotifications(res.data.data)
                setUnreadCount(res.data.data.filter(n => !n.is_read).length)
            } catch (err) {
                console.error("Failed to load notifications", err)
            }
        }
        if (user) fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [user])

    const handleMarkRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error("Failed to mark read", err)
        }
    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            </div>

            {children}

            <div className="flex items-center gap-4">
                <ThemeToggle />
                {/* Notifications - Hidden for ADMIN as requested */}
                {user?.role !== 'ADMIN' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center" variant="destructive">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel className="flex justify-between items-center">
                                <span>Notifications</span>
                                <Badge variant="outline" className="text-[10px] font-bold">New</Badge>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className={cn(
                                                "flex flex-col items-start gap-1 p-4 cursor-pointer border-b last:border-0",
                                                !notification.is_read && "bg-primary/5"
                                            )}
                                            onClick={() => handleMarkRead(notification.id)}
                                        >
                                            <div className="flex justify-between w-full items-start gap-2">
                                                <span className="font-bold text-sm tracking-tight">{notification.title}</span>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground leading-snug">{notification.message}</span>
                                            {!notification.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                                            )}
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem className="flex flex-col items-center gap-1 p-8 cursor-default text-center">
                                        <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <span className="font-medium text-sm text-muted-foreground">No new notifications</span>
                                    </DropdownMenuItem>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all overflow-hidden">
                            <div className="flex items-center justify-center w-full h-full text-primary font-black text-base">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/profile' : user?.role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile')} className="cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export function Sidebar({ className, isOpen, onClose, items }) {
    const location = useLocation();

    const defaultItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/users", icon: Users, label: "User Management" }, // Manage doctors/patients from here
        { href: "/admin/audit", icon: FileText, label: "Audit Logs" },
        { href: "/admin/settings", icon: Settings, label: "Settings" },
    ]

    const navItems = items || defaultItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                <div className="flex h-16 items-center border-b px-6">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <HealthNetLogo className="h-6 w-6 text-primary" />
                        <span>HealthNet</span>
                    </Link>
                </div>
                <div className="py-4">
                    <nav className="space-y-1 px-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => onClose && onClose()}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>
        </>
    )
}
