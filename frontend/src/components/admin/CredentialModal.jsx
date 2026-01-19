import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, FileText, X } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

//Include modals
export function CredentialModal({
    isOpen,
    onClose,
    credentials = { name: "", id: "", password: "", role: "" }
}) {
    if (!isOpen) return null

    const handleDownloadPDF = () => {
        const doc = new jsPDF()

        // Brand Colors
        const primaryColor = [37, 99, 235] // Blue-600
        const secondaryColor = [30, 41, 59] // Slate-800

        // Header
        doc.setFillColor(...primaryColor)
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.text("HealthNet Access Credentials", 105, 20, { align: "center" })

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Official Registration Document", 105, 30, { align: "center" })

        // User Info Section
        doc.setTextColor(...secondaryColor)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`Registration Details for: ${credentials.name}`, 20, 60)

        // Credentials Table
        autoTable(doc, {
            startY: 70,
            head: [['Field', 'Value']],
            body: [
                ['Full Name', credentials.name],
                ['User ID / Username', credentials.id],
                ['Temporary Password', credentials.password],
                ['Assigned Role', credentials.role],
                ['Registration Date', new Date().toLocaleDateString()],
            ],
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 12, cellPadding: 6 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
        })

        // Footer Instructions
        const finalY = doc.lastAutoTable.finalY + 20
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text("IMPORTANT INSTRUCTIONS:", 20, finalY)
        doc.text("1. Please change your password immediately upon first login.", 20, finalY + 7)
        doc.text("2. Keep this document secure. Do not share your credentials.", 20, finalY + 14)
        doc.text("3. For technical support, contact IT Administration.", 20, finalY + 21)

        // Save
        doc.save(`${credentials.name.replace(/\s+/g, '_')}_Credentials.pdf`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-primary/20 shadow-2xl">
                <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2 ring-4 ring-green-50">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight">Registration Successful</DialogTitle>
                    <DialogDescription className="text-center max-w-[90%]">
                        The new user account has been successfully created in the registry.
                        Please download the credentials below.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/30 rounded-xl p-6 border border-border/50 space-y-4 my-4">
                    <div className="space-y-1">
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">User ID</p>
                        <p className="font-mono text-lg font-bold text-foreground bg-background px-3 py-1 rounded border inline-block">
                            {credentials.id}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Temporary Password</p>
                        <p className="font-mono text-lg font-bold text-foreground bg-background px-3 py-1 rounded border inline-block">
                            {credentials.password}
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        <X className="mr-2 h-4 w-4" />
                        Close
                    </Button>
                    <Button onClick={handleDownloadPDF} className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90">
                        <Download className="mr-2 h-4 w-4" />
                        Download Credentials PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
