
import DoctorLayout from "@/layouts/DoctorLayout"
import { AppointmentsList } from "@/components/doctor/AppointmentsList"

export default function DoctorAppointmentsPage() {
    return (
        <DoctorLayout
            title="Appointments"
            subtitle="Manage your schedule and consultations"
        >
            <AppointmentsList />
        </DoctorLayout>
    )
}
