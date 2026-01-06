

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { generateHospitalId } = require('../src/utils/idGenerator');

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set!');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const facilities = [
    { name: 'Black Lion Hospital', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170100', email: 'info@blacklionhospital.et', address: 'Churchill Road' },
    { name: 'Tikur Anbessa Specialized Hospital', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170200', email: 'contact@tikuranbessa.et', address: 'Menen Avenue' },
    { name: 'St. Paul\'s Hospital Millennium Medical College', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170300', email: 'admin@stpaulshospital.et', address: 'Gurd Shola' },
    { name: 'Yekatit 12 Hospital Medical College', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170400', email: 'info@yekatit12.et', address: 'Kazanches' },
    { name: 'Addis Ababa Burn Emergency and Trauma Center', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170500', email: 'emergency@aabetc.et', address: 'Bole Road' },
    { name: 'Zewditu Memorial Hospital', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170600', email: 'contact@zewdituhospital.et', address: 'Siddist Kilo' },
    { name: 'ALERT Hospital', type: 'HOSPITAL', city: 'Addis Ababa', phone: '+251115170700', email: 'info@alerthospital.et', address: 'Kotebe' },
    { name: 'Ethiopian Public Health Institute Central Lab', type: 'LABORATORY', city: 'Addis Ababa', phone: '+251115180100', email: 'lab@ephi.gov.et', address: 'Gulele' },
    { name: 'Addis Ababa City Administration Health Bureau Lab', type: 'LABORATORY', city: 'Addis Ababa', phone: '+251115180200', email: 'lab@aacahb.et', address: 'Megenagna' },
    { name: 'Armauer Hansen Research Institute Lab', type: 'LABORATORY', city: 'Addis Ababa', phone: '+251115180300', email: 'research@ahri.gov.et', address: 'ALERT Compound' }
];

const admins = [
    { id: 'AM-ADBA123456', name: 'Abebe Kebede', email: 'admin1@healthnet.et', gender: 'MALE' },
    { id: 'AM-TICB123456', name: 'Mulugeta Tesfaye', email: 'admin2@healthnet.et', gender: 'MALE' },
    { id: 'AM-STPC123456', name: 'Dawit Solomon', email: 'admin3@healthnet.et', gender: 'MALE' },
    { id: 'AM-YEKD123456', name: 'Tewodros Bekele', email: 'admin4@healthnet.et', gender: 'MALE' },
    { id: 'AM-AABE123456', name: 'Yohannes Haile', email: 'admin5@healthnet.et', gender: 'MALE' },
    { id: 'AM-ZEWF123456', name: 'Alemnesh Tadesse', email: 'admin6@healthnet.et', gender: 'FEMALE' },
    { id: 'AM-ALEG123456', name: 'Hirut Mengistu', email: 'admin7@healthnet.et', gender: 'FEMALE' },
    { id: 'AM-EPHH123456', name: 'Meseret Assefa', email: 'admin8@healthnet.et', gender: 'FEMALE' },
    { id: 'AM-AACH123456', name: 'Selamawit Girma', email: 'admin9@healthnet.et', gender: 'FEMALE' },
    { id: 'AM-AHRJ123456', name: 'Tigist Mulat', email: 'admin10@healthnet.et', gender: 'FEMALE' }
];

async function main() {
    console.log('Starting HealthNet database seed...\n');

    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    for (let i = 0; i < facilities.length; i++) {
        const facility = facilities[i];
        const admin = admins[i];
        const hospitalId = i === 0 ? 'HO-BL12345678' : generateHospitalId();

        await sql`
            INSERT INTO facilities (hospital_id, name, type, city_town, phone, email, address)
            VALUES (${hospitalId}, ${facility.name}, ${facility.type}, ${facility.city}, ${facility.phone}, ${facility.email}, ${facility.address})
        `;
        const facilityId = hospitalId;

        await sql`
            INSERT INTO users (user_id, name, email, phone, password_hash, role, gender, nationality, address, dob)
            VALUES (${admin.id}, ${admin.name}, ${admin.email}, ${`+251911${100000 + i}`}, ${hashedPassword}, 'ADMIN', ${admin.gender}, 'Ethiopian', 'Addis Ababa, Ethiopia', '1985-01-01')
        `;

        await sql`
            INSERT INTO admins (admin_id, user_id, facility_id)
            VALUES (${admin.id}, ${admin.id}, ${facilityId})
        `;

        console.log(`Seeded: ${facility.name} with Admin: ${admin.name}`);
    }

    console.log('\nSeeding completed successfully!');
    console.log('\nAll admins use password: Admin123!');
}

main()
    .catch(e => {
        console.error('Seeding failed:', e);
        process.exit(1);
    });