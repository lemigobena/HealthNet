
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AssignmentPage from './pages/admin/AssignmentPage';
import RegisterPage from './pages/admin/RegisterPage';
import RegisterDoctorPage from './pages/admin/RegisterDoctorPage';
import RegisterPatientPage from './pages/admin/RegisterPatientPage';
import MyPatientsPage from './pages/admin/MyPatientsPage';
import MyDoctorsPage from './pages/admin/MyDoctorsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminViewPatientPage from './pages/admin/AdminViewPatientPage';
import AdminViewDoctorPage from './pages/admin/AdminViewDoctorPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorLabResultsPage from './pages/doctor/DoctorLabResultsPage';
import DoctorPatientDetailPage from './pages/doctor/DoctorPatientDetailPage';
import DoctorRecordsPage from './pages/doctor/DoctorRecordsPage';
import DoctorMyLabResultsPage from './pages/doctor/DoctorMyLabResultsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorDiagnosesPage from './pages/doctor/DoctorDiagnosesPage';
import DoctorLabResultDetailPage from './pages/doctor/DoctorLabResultDetailPage';
import CreateAppointmentPage from './pages/doctor/CreateAppointmentPage';
import RescheduleAppointmentPage from './pages/doctor/RescheduleAppointmentPage';
import CreateLabResultPage from './pages/doctor/CreateLabResultPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientRecordsPage from './pages/patient/PatientRecordsPage';
import PatientRecordDetailPage from './pages/patient/PatientRecordDetailPage';
import PatientLabResultsPage from './pages/patient/PatientLabResultsPage';
import PatientLabResultDetailPage from './pages/patient/PatientLabResultDetailPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import PatientEmergencyInfoPage from './pages/patient/PatientEmergencyInfoPage';
import PatientQRCodePage from './pages/patient/PatientQRCodePage';
import PatientDoctorsPage from './pages/patient/PatientDoctorsPage';
import PatientDoctorDetailPage from './pages/patient/PatientDoctorDetailPage';
import EmergencyPortal from './pages/EmergencyPortal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/emergency" element={<EmergencyPortal />} />
          <Route path="/emergency/:id" element={<EmergencyPortal />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/assignment" element={<ProtectedRoute allowedRoles={['ADMIN']}><AssignmentPage /></ProtectedRoute>} />
          <Route path="/admin/register" element={<ProtectedRoute allowedRoles={['ADMIN']}><RegisterPage /></ProtectedRoute>} />
          <Route path="/admin/register/doctor" element={<ProtectedRoute allowedRoles={['ADMIN']}><RegisterDoctorPage /></ProtectedRoute>} />
          <Route path="/admin/register/patient" element={<ProtectedRoute allowedRoles={['ADMIN']}><RegisterPatientPage /></ProtectedRoute>} />
          <Route path="/admin/my-patients" element={<ProtectedRoute allowedRoles={['ADMIN']}><MyPatientsPage /></ProtectedRoute>} />
          <Route path="/admin/my-doctors" element={<ProtectedRoute allowedRoles={['ADMIN']}><MyDoctorsPage /></ProtectedRoute>} />
          <Route path="/admin/patients/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminViewPatientPage /></ProtectedRoute>} />
          <Route path="/admin/doctors/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminViewDoctorPage /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProfilePage /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorPatientsPage /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorPatientDetailPage /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorAppointmentsPage /></ProtectedRoute>} />
          <Route path="/doctor/appointments/new" element={<ProtectedRoute allowedRoles={['DOCTOR']}><CreateAppointmentPage /></ProtectedRoute>} />
          <Route path="/doctor/appointments/reschedule/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><RescheduleAppointmentPage /></ProtectedRoute>} />
          <Route path="/doctor/records" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorRecordsPage /></ProtectedRoute>} />
          <Route path="/doctor/lab-results" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorMyLabResultsPage /></ProtectedRoute>} />
          <Route path="/doctor/lab-results/new" element={<ProtectedRoute allowedRoles={['DOCTOR']}><CreateLabResultPage /></ProtectedRoute>} />
          <Route path="/doctor/lab-results/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorLabResultDetailPage /></ProtectedRoute>} />
          <Route path="/doctor/diagnoses/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDiagnosesPage /></ProtectedRoute>} />
          <Route path="/doctor/diagnoses" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDiagnosesPage /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorProfilePage /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientRecordsPage /></ProtectedRoute>} />
          <Route path="/patient/records/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientRecordDetailPage /></ProtectedRoute>} />
          <Route path="/patient/lab-results" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientLabResultsPage /></ProtectedRoute>} />
          <Route path="/patient/lab-results/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientLabResultDetailPage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientAppointmentsPage /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientProfilePage /></ProtectedRoute>} />
          <Route path="/patient/emergency-info" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientEmergencyInfoPage /></ProtectedRoute>} />
          <Route path="/patient/qr" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientQRCodePage /></ProtectedRoute>} />
          <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDoctorsPage /></ProtectedRoute>} />
          <Route path="/patient/doctors/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDoctorDetailPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
