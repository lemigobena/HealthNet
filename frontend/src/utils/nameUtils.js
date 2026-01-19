export const formatName = (user) => {
    if (!user) return "";

    const { name, role, gender } = user;

    // Check if user is a doctor
    if (role === 'DOCTOR') {
        // If we have the doctor profile and type, check if Medical Doctor
        // Some user objects might have doctor_profile nested
        const type = user.doctor_profile?.type || user.type;

        // If type is explicitly MEDICAL_DOCTOR or simply not a LAB_TECHNICIAN (assuming default to Dr if unknown for Doctor role, unless strictly Medical Doctor specified)
        // Requirements: "Dr. For all medical doctors"
        // If we don't have type info but role is DOCTOR, what to do?
        // Assuming 'type' is available on the user object or nested profile.

        if (type === 'MEDICAL_DOCTOR') {
            return `Dr. ${name}`;
        }

        // If Lab Tech, fall through to gender check? 
        // "Mr. for all males except Medical Doctors" -> Implies Lab Tech Male = Mr.
    }

    // Gender based prefixes
    if (gender === 'MALE') {
        return `Mr. ${name}`;
    } else if (gender === 'FEMALE') {
        return `Mrs. ${name}`;
    }

    // Default if no gender or unknown
    return name;
};

// Helper for situations where you have separate pieces of data
export const formatNameRaw = (name, role, gender, doctorType) => {
    if (role === 'DOCTOR' && doctorType === 'MEDICAL_DOCTOR') {
        return `Dr. ${name}`;
    }
    if (gender === 'MALE') return `Mr. ${name}`;
    if (gender === 'FEMALE') return `Mrs. ${name}`;
    return name;
};
