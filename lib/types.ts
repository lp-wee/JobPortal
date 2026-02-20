export interface User {
  id: number
  email: string
  role: 'job_seeker' | 'employer' | 'admin'
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  created_at: string
}

export interface Company {
  id: number
  user_id: number
  name: string
  description: string
  logo?: string
  website?: string
  location?: string
  industry?: string
  employee_count?: number
  rating: number
  active_vacancies?: number
  created_at: string
}

export interface Vacancy {
  id: number
  company_id: number
  company_name: string
  company_logo?: string
  title: string
  description: string
  salary_min?: number
  salary_max?: number
  currency: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'lead'
  location?: string
  industry?: string
  skills_required: string[]
  applications_count: number
  views_count: number
  is_active: boolean
  created_at: string
  deadline?: string
}

export interface Application {
  id: number
  vacancy_id: number
  vacancy_title?: string
  job_seeker_id: number
  first_name?: string
  last_name?: string
  email?: string
  resume_id?: number
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  cover_letter?: string
  created_at: string
}
