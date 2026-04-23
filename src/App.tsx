import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import VacanciesPage from "./pages/Vacancies";
import VacancyDetailPage from "./pages/VacancyDetail";
import CompaniesPage from "./pages/Companies";
import ServicesPage from "./pages/Services";
import AdminPage from "./pages/Admin";
import CabinetLayout from "./pages/cabinet/CabinetLayout";
import CabinetDashboard from "./pages/cabinet/CabinetDashboard";
import CabinetApplications from "./pages/cabinet/CabinetApplications";
import CabinetResumes from "./pages/cabinet/CabinetResumes";
import CabinetMessages from "./pages/cabinet/CabinetMessages";
import CabinetSaved from "./pages/cabinet/CabinetSaved";
import CabinetSettings from "./pages/cabinet/CabinetSettings";
import EmployerLayout from "./pages/employer/EmployerLayout";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerVacancies from "./pages/employer/EmployerVacancies";
import EmployerNewVacancy from "./pages/employer/EmployerNewVacancy";
import EmployerApplications from "./pages/employer/EmployerApplications";
import EmployerMessages from "./pages/employer/EmployerMessages";
import EmployerCompany from "./pages/employer/EmployerCompany";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/vacancies/:id" element={<VacancyDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cabinet" element={<CabinetLayout />}>
            <Route index element={<CabinetDashboard />} />
            <Route path="applications" element={<CabinetApplications />} />
            <Route path="resumes" element={<CabinetResumes />} />
            <Route path="messages" element={<CabinetMessages />} />
            <Route path="saved" element={<CabinetSaved />} />
            <Route path="settings" element={<CabinetSettings />} />
          </Route>
          <Route path="/employer" element={<EmployerLayout />}>
            <Route index element={<EmployerDashboard />} />
            <Route path="vacancies" element={<EmployerVacancies />} />
            <Route path="vacancy/new" element={<EmployerNewVacancy />} />
            <Route path="vacancy/edit/:id" element={<EmployerNewVacancy />} />
            <Route path="applications" element={<EmployerApplications />} />
            <Route path="messages" element={<EmployerMessages />} />
            <Route path="company" element={<EmployerCompany />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
