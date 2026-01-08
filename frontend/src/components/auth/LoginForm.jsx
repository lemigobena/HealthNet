
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircleIcon } from "@/components/icons"
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, User, Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
    const { login } = useAuth()
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!userId || !password) {
            setError("Please fill in all fields")
            return
        }

        setIsLoading(true)
        try {
            await login(userId, password)
            // AuthContext will handle redirect based on user role from backend
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Invalid credentials or server error")
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full border-none shadow-xl bg-white/50 backdrop-blur-xl dark:bg-card/50 ring-1 ring-border/20">
            <CardHeader className="text-center space-y-2 pb-8">
                <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Welcome Back</CardTitle>
                <CardDescription className="text-base">Sign in to your HealthNet workspace</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 border-none bg-destructive/10 text-destructive font-semibold">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        {/* User ID */}
                        <div className="space-y-1.5">
                            <Label htmlFor="userId" className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">User ID</Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                <Input
                                    id="userId"
                                    type="text"
                                    placeholder="Enter your User ID"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="h-12 pl-11 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground ml-1">You can also use your email address</p>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" title="Enter Password" className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-11 pr-10 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background transition-all"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer">
                            Remember my session
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Wait...
                            </>
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In <ArrowRight className="h-4 w-4" />
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 text-center text-sm border-t bg-muted/20 py-6 text-muted-foreground rounded-b-xl">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-xs uppercase tracking-wide">Secure AES-256 Connection</span>
                </div>
            </CardFooter>
        </Card >
    )
}
