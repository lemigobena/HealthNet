
import PatientLayout from "@/layouts/PatientLayout"
import { QRCodeView } from "@/components/patient/QRCodeView"

export default function PatientQRCodePage() {
    return (
        <PatientLayout
            title="SafePass QR"
            subtitle="Secure emergency access"
        >
            <div className="max-w-5xl mx-auto">
                <QRCodeView />
            </div>
        </PatientLayout>
    )
}
