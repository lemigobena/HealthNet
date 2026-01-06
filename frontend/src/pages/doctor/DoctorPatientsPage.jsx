
import DoctorLayout from "@/layouts/DoctorLayout"
import { PatientsList } from "@/components/doctor/PatientsList"

export default function DoctorPatientsPage() {
    return (
        <DoctorLayout
            title="My Patients"
            subtitle="Manage your patient registry"
        >
            <PatientsList />
        </DoctorLayout>
    )
}
