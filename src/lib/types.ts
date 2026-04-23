export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string | null;
  company_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  verification_status: VerificationStatus;
  verification_doc_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  description: string;
  location: string;
  industry: string;
  logo_url?: string | null;
  website?: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
  active_vacancies?: number;
}

export interface Vacancy {
  id: string;
  user_id: string;
  company_id?: string | null;
  title: string;
  description: string;
  salary_min?: number | null;
  salary_max?: number | null;
  currency: string;
  employment_type: string;
  experience_level: string;
  location?: string | null;
  industry?: string | null;
  skills_required: string[];
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  applications_count?: number;
  company_name?: string;
  employer_first_name?: string;
  employer_last_name?: string;
}

export interface Application {
  id: string;
  vacancy_id: string;
  user_id: string;
  status: ApplicationStatus;
  cover_letter?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  vacancy_title?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_name?: string | null;
  file_url?: string | null;
  content?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  vacancy_id?: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined
  sender_name?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  target_role: UserRole;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface UserService {
  id: string;
  user_id: string;
  service_id: string;
  activated_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  service?: Service;
}
