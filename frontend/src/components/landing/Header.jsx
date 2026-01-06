import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { HealthNetLogo, QRCodeIcon } from "@/components/icons"
import { Menu, X } from "lucide-react"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Smooth scroll to section
    const handleAnchorClick = (e, href) => {
        if (href.startsWith("#")) {
            e.preventDefault()
            const element = document.querySelector(href)
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" })
                setIsMenuOpen(false)
            }
        }
    }

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled
                ? "bg-background/80 backdrop-blur-lg shadow-sm"
                : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                }`}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" aria-label="HealthNet Home">
                    <HealthNetLogo aria-hidden="true" />
                    <span className="text-xl font-bold text-foreground">HealthNet</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
                    <a
                        href="#features"
                        onClick={(e) => handleAnchorClick(e, "#features")}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#roles"
                        onClick={(e) => handleAnchorClick(e, "#roles")}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        User Roles
                    </a>
                </nav>

                {/* Desktop CTA */}
                <div className="hidden items-center gap-4 md:flex">
                    <Button variant="ghost" asChild className="transition-transform hover:scale-105">
                        <Link to="/emergency">
                            <QRCodeIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                            Scan QR
                        </Link>
                    </Button>
                    <Button asChild className="transition-transform hover:scale-105">
                        <Link to="/login">Login</Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="border-t bg-background p-4 md:hidden animate-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
                        <a
                            href="#features"
                            onClick={(e) => handleAnchorClick(e, "#features")}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#roles"
                            onClick={(e) => handleAnchorClick(e, "#roles")}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            User Roles
                        </a>
                        <hr className="my-2" aria-hidden="true" />
                        <Button variant="outline" asChild className="w-full bg-transparent">
                            <Link to="/emergency">
                                <QRCodeIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                Scan QR
                            </Link>
                        </Button>
                        <Button asChild className="w-full">
                            <Link to="/login">Login</Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
