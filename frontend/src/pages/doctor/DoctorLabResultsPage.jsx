import { useLocation } from "react-router-dom"
import DoctorLayout from "@/layouts/DoctorLayout"
import { UploadLabResultForm } from "@/components/doctor/UploadLabResultForm"

export default function DoctorLabResultsPage() {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const patientId = queryParams.get('patient')

    return (
        <DoctorLayout
            title="Lab Results"
            subtitle="Securely upload and manage laboratory reports"
        >
            <div className="max-w-3xl mx-auto">
                <UploadLabResultForm initialPatientId={patientId} />
            </div>
        </DoctorLayout>
    )
}
