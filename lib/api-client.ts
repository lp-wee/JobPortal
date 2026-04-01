const API_BASE_URL = '/api'

interface FetchOptions extends RequestInit {
  skipErrorHandling?: boolean
  skipAuth?: boolean
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const auth = localStorage.getItem('auth')
  if (!auth) return null
  try {
    const { access_token } = JSON.parse(auth)
    return access_token || null
  } catch {
    return null
  }
}

async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipErrorHandling, skipAuth, ...fetchOptions } = options

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    } as Record<string, string>

    if (!skipAuth) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      headers,
      ...fetchOptions,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))

      if (response.status === 401 && !skipAuth) {
        localStorage.removeItem('auth')
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      if (!skipErrorHandling) {
        console.error(`[API Error] ${endpoint}:`, error)
      }
      throw new Error(error.error || error.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    if (!skipErrorHandling) {
      console.error(`[API Fetch Error] ${endpoint}:`, error)
    }
    throw error
  }
}

// ==================== AUTHENTICATION ====================

export async function registerUser(data: {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'job_seeker' | 'employer' | 'admin'
  phone?: string
  company_name?: string
}) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  })
}

export async function loginUser(data: {
  email: string
  password: string
  role: 'job_seeker' | 'employer' | 'admin'
}) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  })
}

export async function logoutUser() {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
    })
  } finally {
    localStorage.removeItem('auth')
  }
}

// ==================== VACANCIES ====================

export async function fetchVacancies(filters?: {
  search?: string
  location?: string
  employmentType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
}) {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.location) params.append('location', filters.location)
  if (filters?.employmentType) params.append('employmentType', filters.employmentType)
  if (filters?.experienceLevel) params.append('experienceLevel', filters.experienceLevel)
  if (filters?.salaryMin) params.append('salaryMin', filters.salaryMin.toString())
  if (filters?.salaryMax) params.append('salaryMax', filters.salaryMax.toString())

  return apiFetch(`/vacancies?${params.toString()}`)
}

export async function fetchVacancy(id: string) {
  return apiFetch(`/vacancies/${id}`)
}

export async function fetchEmployerVacancies() {
  return apiFetch('/employer/vacancies')
}

export async function createVacancy(data: {
  title: string
  description: string
  salary_min?: number
  salary_max?: number
  employment_type: string
  experience_level: string
  location?: string
  skills_required?: string[]
}) {
  return apiFetch('/vacancies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateVacancy(
  id: string,
  data: {
    title?: string
    description?: string
    salary_min?: number
    salary_max?: number
    employment_type?: string
    experience_level?: string
    location?: string
    is_active?: boolean
  }
) {
  return apiFetch(`/vacancies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ==================== APPLICATIONS ====================

export async function fetchApplications(filters?: {
  vacancy_id?: number
}) {
  const params = new URLSearchParams()
  if (filters?.vacancy_id) params.append('vacancy_id', filters.vacancy_id.toString())
  return apiFetch(`/applications?${params.toString()}`)
}

export async function createApplication(data: {
  vacancy_id: number
  cover_letter?: string
  resume_id?: number
}) {
  return apiFetch('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateApplicationStatus(id: number, status: string) {
  return apiFetch(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

// ==================== SAVED JOBS ====================

export async function fetchSavedJobs() {
  return apiFetch('/saved-jobs')
}

export async function toggleSaveJob(vacancyId: number) {
  return apiFetch(`/saved-jobs/${vacancyId}`, {
    method: 'POST',
  })
}

// ==================== RESUMES ====================

export async function fetchResumes() {
  return apiFetch('/resumes')
}

export async function createResume(data: { title: string; file_url?: string }) {
  return apiFetch('/resumes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteResume(id: number) {
  return apiFetch(`/resumes/${id}`, {
    method: 'DELETE',
  })
}

// ==================== MESSAGES ====================

export async function fetchMessages() {
  return apiFetch('/messages')
}

export async function sendMessage(data: {
  recipient_id: number
  title: string
  content: string
}) {
  return apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function markMessageRead(id: number) {
  return apiFetch(`/messages/${id}/read`, {
    method: 'PUT',
  })
}

// ==================== COMPANIES ====================

export async function fetchCompany(id: number) {
  return apiFetch(`/companies/${id}`)
}

export async function fetchAllCompanies() {
  return apiFetch('/companies')
}

// ==================== ADMIN ====================

export async function fetchAdminStats() {
  return apiFetch('/admin/stats')
}

export async function fetchAdminUsers() {
  return apiFetch('/admin/users')
}

export async function deleteAdminUser(id: number) {
  return apiFetch(`/admin/users/${id}`, { method: 'DELETE' })
}

export async function fetchAdminVacancies() {
  return apiFetch('/admin/vacancies')
}

export async function toggleAdminVacancy(id: number, is_active: boolean) {
  return apiFetch(`/admin/vacancies/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ is_active }),
  })
}

export async function checkApplicationStatus(vacancyId: number) {
  return apiFetch(`/applications/check/${vacancyId}`, { skipErrorHandling: true })
}

export async function fetchConversation(userId: number) {
  return apiFetch(`/messages/conversation/${userId}`)
}

export async function fetchMessageContacts() {
  return apiFetch('/messages/contacts')
}

// ==================== HEALTH CHECK ====================

export async function checkAPIHealth() {
  try {
    return await apiFetch('/health')
  } catch (error) {
    console.error('[API] Health check failed:', error)
    return null
  }
}
