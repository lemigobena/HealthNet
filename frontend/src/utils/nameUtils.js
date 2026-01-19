export const formatName = (user) => {
    if (!user) return "";

    const { name, role, gender } = user;
    const type = user.doctor_profile?.type || user.type;

    // Check if user is a Medical Doctor
    if (role === 'DOCTOR' && type === 'MEDICAL_DOCTOR') {
        return `Dr. ${name}`;
    }

    // Gender based prefixes for everyone else (including Lab Technicians, Patients, Admins)
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
