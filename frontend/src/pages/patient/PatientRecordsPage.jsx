import { useState, useEffect } from "react"
import PatientLayout from "@/layouts/PatientLayout"
import { HealthRecords } from "@/components/patient/HealthRecords"
import api from "@/services/api"

export default function PatientRecordsPage() {
    const [records, setRecords] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await api.get('/patient/diagnoses')
                setRecords(response.data.data)
            } catch (err) {
                console.error("Failed to fetch medical records", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecords()
    }, [])

    return (
        <PatientLayout
            title="Medical Records"
            subtitle="Access your complete medical history and diagnostic archives"
        >
            <div className="max-w-4xl mx-auto">
                <HealthRecords records={records} isLoading={isLoading} />
            </div>
        </PatientLayout>
    )
}
