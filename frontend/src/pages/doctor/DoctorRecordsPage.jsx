import { useState, useEffect } from "react"
import DoctorLayout from "@/layouts/DoctorLayout"
import { HealthRecords } from "@/components/patient/HealthRecords"
import { Loader2 } from "lucide-react"
import api from "@/services/api"

export default function DoctorRecordsPage() {
    const [records, setRecords] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await api.get('/doctor/diagnoses')
                setRecords(response.data.data)
            } catch (err) {
                console.error("Failed to fetch doctor records", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecords()
    }, [])

    return (
        <DoctorLayout
            title="My Clinical Records"
            subtitle="Archive of all patient diagnoses registered by your account"
        >
            <div className="max-w-6xl mx-auto">
                <HealthRecords
                    records={records}
                    isLoading={isLoading}
                    emptyMessage="You haven't registered any medical records yet."
                />
            </div>
        </DoctorLayout>
    )
}
