const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface FetchOptions extends RequestInit {
  skipErrorHandling?: boolean
  skipAuth?: boolean
}

// Get auth token from localStorage
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

// Refresh token if needed
async function refreshAuthToken(): Promise<boolean> {
  try {
    const auth = localStorage.getItem('auth')
    if (!auth) return false
    
    const { refresh_token } = JSON.parse(auth)
    if (!refresh_token) return false

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    })

    if (!response.ok) {
      // Clear invalid auth
      localStorage.removeItem('auth')
      return false
    }

    const data = await response.json()
    const { access_token, expires_in } = data

    // Update stored token
    const currentAuth = JSON.parse(auth)
    localStorage.setItem(
      'auth',
      JSON.stringify({
        ...currentAuth,
        access_token,
        expires_at: Date.now() + expires_in * 1000,
      })
    )

    return true
  } catch (error) {
    console.error('[API] Token refresh failed:', error)
    localStorage.removeItem('auth')
    return false
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

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    let response = await fetch(url, {
      headers,
      ...fetchOptions,
    })

    // If 401, try to refresh token once and retry
    if (response.status === 401 && !skipAuth) {
      const refreshed = await refreshAuthToken()
      if (refreshed) {
        const newToken = getAuthToken()
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(url, {
            headers,
            ...fetchOptions,
          })
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      
      // If still 401 after refresh, clear auth and let app handle redirect
      if (response.status === 401) {
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

export async function getCurrentUser() {
  return apiFetch('/users/me')
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

export async function createVacancy(data: {
  company_id: number
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
  job_seeker_id?: number
  vacancy_id?: number
}) {
  const params = new URLSearchParams()

  if (filters?.job_seeker_id) params.append('job_seeker_id', filters.job_seeker_id.toString())
  if (filters?.vacancy_id) params.append('vacancy_id', filters.vacancy_id.toString())

  return apiFetch(`/applications?${params.toString()}`)
}

export async function createApplication(data: {
  vacancy_id: number
  job_seeker_id: number
  resume_id?: number
  cover_letter?: string
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

export async function fetchSavedJobs(jobSeekerId: number) {
  return apiFetch(`/saved-jobs/${jobSeekerId}`)
}

export async function toggleSaveJob(jobSeekerId: number, vacancyId: number) {
  return apiFetch(`/saved-jobs/${jobSeekerId}/${vacancyId}`, {
    method: 'POST',
  })
}

// ==================== COMPANIES ====================

export async function fetchCompany(id: number) {
  return apiFetch(`/companies/${id}`)
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
