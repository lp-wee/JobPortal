import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Load environment variables
dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SALT_ROUNDS = 10

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fan_club',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Test database connection on startup
pool.on('error', (err) => {
  console.error('[Database] Connection error:', err)
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ==================== HELPER FUNCTIONS ====================

// Helper to get expires_in from JWT token
const getExpiresInFromToken = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as any
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000)
      return decoded.exp - now
    }
    return 86400 // 24 hours default
  } catch (error) {
    console.error('Failed to decode token:', error)
    return 86400
  }
}

// Helper to format user response
const formatUserResponse = (user: any) => {
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}

// ==================== AUTH MIDDLEWARE ====================

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  }
}

// Authentication middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Role-based authorization middleware
const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      phone, 
      role,
      // Company fields (if role is employer)
      company_name,
      company_description,
      company_website,
      company_location,
      company_industry,
      // Job seeker fields (if role is job_seeker)
      title,
      bio,
      location,
      experience_years,
      skills
    } = req.body

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at`,
      [email, hashedPassword, first_name, last_name, phone, role || 'job_seeker']
    )

    const user = userResult.rows[0]

    // Create role-specific profile
    if (role === 'employer') {
      // Validate company fields
      if (!company_name) {
        throw new Error('Company name is required for employer registration')
      }

      const companyResult = await client.query(
        `INSERT INTO companies (user_id, name, description, website, location, industry)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, description, website, location, industry, logo, employee_count, rating`,
        [user.id, company_name, company_description, company_website, company_location, company_industry]
      )
      
      user.profile = companyResult.rows[0]
    } else {
      // Default to job_seeker
      const jobSeekerResult = await client.query(
        `INSERT INTO job_seekers (user_id, title, bio, location, experience_years, skills)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, bio, location, experience_years, skills`,
        [user.id, title, bio, location, experience_years || 0, skills || []]
      )
      
      user.profile = jobSeekerResult.rows[0]
    }

    await client.query('COMMIT')

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Calculate expires_in from token
    const expires_in = getExpiresInFromToken(token)

    // Remove sensitive data
    const userResponse = formatUserResponse(user)

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token: {
        access_token: token,
        refresh_token: token, // In production, you might want to generate a separate refresh token
        expires_in: expires_in
      }
    })

  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Error registering user:', error)
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
})

// Login user
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Get user with role-specific data
    const userResult = await pool.query(
      `SELECT u.*, 
              CASE 
                WHEN u.role = 'employer' THEN json_build_object(
                  'id', c.id,
                  'name', c.name,
                  'description', c.description,
                  'logo', c.logo,
                  'website', c.website,
                  'location', c.location,
                  'industry', c.industry,
                  'employee_count', c.employee_count,
                  'rating', c.rating
                )
                WHEN u.role = 'job_seeker' THEN json_build_object(
                  'id', js.id,
                  'title', js.title,
                  'bio', js.bio,
                  'skills', js.skills,
                  'location', js.location,
                  'experience_years', js.experience_years
                )
                ELSE NULL
              END as profile
       FROM users u
       LEFT JOIN companies c ON u.id = c.user_id AND u.role = 'employer'
       LEFT JOIN job_seekers js ON u.id = js.user_id AND u.role = 'job_seeker'
       WHERE u.email = $1`,
      [email]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = userResult.rows[0]

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Calculate expires_in from token
    const expires_in = getExpiresInFromToken(token)

    // Remove sensitive data
    const userResponse = formatUserResponse(user)

    res.json({
      message: 'Login successful',
      user: userResponse,
      token: {
        access_token: token,
        refresh_token: token, // In production, you might want to generate a separate refresh token
        expires_in: expires_in
      }
    })

  } catch (error: any) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.avatar, u.created_at, u.updated_at,
              CASE 
                WHEN u.role = 'employer' THEN (
                  SELECT json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'description', c.description,
                    'logo', c.logo,
                    'website', c.website,
                    'location', c.location,
                    'industry', c.industry,
                    'employee_count', c.employee_count,
                    'rating', c.rating
                  )
                  FROM companies c
                  WHERE c.user_id = u.id
                )
                WHEN u.role = 'job_seeker' THEN (
                  SELECT json_build_object(
                    'id', js.id,
                    'title', js.title,
                    'bio', js.bio,
                    'location', js.location,
                    'experience_years', js.experience_years,
                    'skills', js.skills
                  )
                  FROM job_seekers js
                  WHERE js.user_id = u.id
                )
                ELSE NULL
              END as profile
       FROM users u
       WHERE u.id = $1`,
      [req.user?.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userResponse = formatUserResponse(userResult.rows[0])
    res.json(userResponse)

  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: error.message })
  }
})

// Refresh token
app.post('/api/auth/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { 
        id: req.user?.id, 
        email: req.user?.email, 
        role: req.user?.role,
        first_name: req.user?.first_name,
        last_name: req.user?.last_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Calculate expires_in from token
    const expires_in = getExpiresInFromToken(token)

    res.json({
      token: {
        access_token: token,
        refresh_token: token,
        expires_in: expires_in
      }
    })

  } catch (error: any) {
    console.error('Error refreshing token:', error)
    res.status(500).json({ error: error.message })
  }
})

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    // Get user's current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user?.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const validPassword = await bcrypt.compare(current_password, userResult.rows[0].password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS)

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user?.id]
    )

    res.json({ message: 'Password changed successfully' })

  } catch (error: any) {
    console.error('Error changing password:', error)
    res.status(500).json({ error: error.message })
  }
})

// Logout
app.post('/api/auth/logout', authenticateToken, (req: Request, res: Response) => {
  // In production, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' })
})

// ==================== PROTECTED EXAMPLE ROUTES ====================

// Example of protected route
app.get('/api/protected', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user 
  })
})

// Example of role-restricted route
app.get('/api/employer-only', 
  authenticateToken, 
  authorizeRoles('employer'), 
  (req: AuthRequest, res: Response) => {
    res.json({ 
      message: 'This route is only for employers', 
      user: req.user 
    })
  }
)

// ==================== VACANCIES ROUTES ====================

// Get all vacancies with filters
app.get('/api/vacancies', async (req: Request, res: Response) => {
  try {
    const { search, location, employmentType, experienceLevel, salaryMin, salaryMax } = req.query

    let query = `
      SELECT v.*, c.name as company_name, c.logo as company_logo
      FROM vacancies v
      JOIN companies c ON v.company_id = c.id
      WHERE v.is_active = true
    `
    const params: any[] = []

    if (search) {
      query += ` AND (v.title ILIKE $${params.length + 1} OR v.description ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    if (location) {
      query += ` AND v.location ILIKE $${params.length + 1}`
      params.push(`%${location}%`)
    }

    if (employmentType) {
      const typeMap: Record<string, string> = {
        'full_time': 'full_time',
        'part_time': 'part_time',
        'contract': 'contract',
        'freelance': 'freelance',
        'internship': 'internship'
      }
      const mappedType = typeMap[employmentType as string] || employmentType
      query += ` AND v.employment_type = $${params.length + 1}`
      params.push(mappedType)
    }

    if (experienceLevel) {
      query += ` AND v.experience_level = $${params.length + 1}`
      params.push(experienceLevel)
    }

    if (salaryMin) {
      query += ` AND v.salary_max >= $${params.length + 1}`
      params.push(parseInt(salaryMin as string))
    }

    if (salaryMax) {
      query += ` AND v.salary_min <= $${params.length + 1}`
      params.push(parseInt(salaryMax as string))
    }

    query += ' ORDER BY v.created_at DESC LIMIT 100'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching vacancies:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get single vacancy
app.get('/api/vacancies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT v.*, c.name as company_name, c.logo as company_logo, c.website, c.location as company_location,
              c.description as company_description, c.rating as company_rating
       FROM vacancies v
       JOIN companies c ON v.company_id = c.id
       WHERE v.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vacancy not found' })
    }

    // Increment views
    await pool.query('UPDATE vacancies SET views_count = views_count + 1 WHERE id = $1', [id])

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error fetching vacancy:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create vacancy (employer only)
app.post('/api/vacancies', authenticateToken, authorizeRoles('employer'), async (req: AuthRequest, res: Response) => {
  try {
    // Get company id for the current user
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user?.id]
    )

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' })
    }

    const company_id = companyResult.rows[0].id
    const { title, description, salary_min, salary_max, employment_type, experience_level, location, skills_required } = req.body

    const result = await pool.query(
      `INSERT INTO vacancies (company_id, title, description, salary_min, salary_max, employment_type, experience_level, location, skills_required)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [company_id, title, description, salary_min, salary_max, employment_type, experience_level, location, skills_required || []]
    )

    res.status(201).json(result.rows[0])
  } catch (error: any) {
    console.error('Error creating vacancy:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update vacancy (employer only)
app.put('/api/vacancies/:id', authenticateToken, authorizeRoles('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, salary_min, salary_max, employment_type, experience_level, location, is_active } = req.body

    // Verify that the vacancy belongs to the employer's company
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user?.id]
    )

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' })
    }

    const company_id = companyResult.rows[0].id

    const result = await pool.query(
      `UPDATE vacancies 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           salary_min = COALESCE($3, salary_min),
           salary_max = COALESCE($4, salary_max),
           employment_type = COALESCE($5, employment_type),
           experience_level = COALESCE($6, experience_level),
           location = COALESCE($7, location),
           is_active = COALESCE($8, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [title ?? null, description ?? null, salary_min ?? null, salary_max ?? null, employment_type ?? null, experience_level ?? null, location ?? null, is_active ?? null, id, company_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vacancy not found or you do not have permission' })
    }

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error updating vacancy:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== APPLICATIONS ROUTES ====================

// Get applications for job seeker or vacancy
app.get('/api/applications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { vacancy_id } = req.query
    let query, params

    if (req.user?.role === 'job_seeker') {
      // Job seeker can only see their own applications
      query = `
        SELECT a.*, v.title as vacancy_title, c.name as company_name, c.logo as company_logo
        FROM applications a
        JOIN vacancies v ON a.vacancy_id = v.id
        JOIN companies c ON v.company_id = c.id
        JOIN job_seekers js ON a.job_seeker_id = js.id
        WHERE js.user_id = $1
      `
      params = [req.user.id]

      if (vacancy_id) {
        query += ` AND a.vacancy_id = $2`
        params.push(vacancy_id)
      }
    } else if (req.user?.role === 'employer') {
      // Employer can see applications for their vacancies
      query = `
        SELECT a.*, v.title as vacancy_title, js.id as job_seeker_id, u.first_name, u.last_name, u.email, js.skills, js.experience_years
        FROM applications a
        JOIN vacancies v ON a.vacancy_id = v.id
        JOIN companies c ON v.company_id = c.id
        JOIN job_seekers js ON a.job_seeker_id = js.id
        JOIN users u ON js.user_id = u.id
        WHERE c.user_id = $1
      `
      params = [req.user.id]

      if (vacancy_id) {
        query += ` AND a.vacancy_id = $2`
        params.push(vacancy_id)
      }
    } else {
      return res.status(403).json({ error: 'Access denied' })
    }

    query += ' ORDER BY a.created_at DESC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ error: error.message })
  }
})

// Create application (job seeker only)
app.post('/api/applications', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const { vacancy_id, resume_id, cover_letter } = req.body

    // Get job seeker id
    const jobSeekerResult = await pool.query(
      'SELECT id FROM job_seekers WHERE user_id = $1',
      [req.user?.id]
    )

    if (jobSeekerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' })
    }

    const job_seeker_id = jobSeekerResult.rows[0].id

    // Check if already applied
    const existingApp = await pool.query(
      'SELECT id FROM applications WHERE vacancy_id = $1 AND job_seeker_id = $2',
      [vacancy_id, job_seeker_id]
    )

    if (existingApp.rows.length > 0) {
      return res.status(400).json({ error: 'Already applied to this vacancy' })
    }

    const result = await pool.query(
      `INSERT INTO applications (vacancy_id, job_seeker_id, resume_id, cover_letter, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [vacancy_id, job_seeker_id, resume_id, cover_letter]
    )

    // Increment applications count
    await pool.query('UPDATE vacancies SET applications_count = applications_count + 1 WHERE id = $1', [vacancy_id])

    res.status(201).json(result.rows[0])
  } catch (error: any) {
    console.error('Error creating application:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update application status (employer only)
app.put('/api/applications/:id', authenticateToken, authorizeRoles('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Verify that the application belongs to employer's vacancy
    const result = await pool.query(
      `UPDATE applications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND vacancy_id IN (
         SELECT v.id FROM vacancies v
         JOIN companies c ON v.company_id = c.id
         WHERE c.user_id = $3
       )
       RETURNING *`,
      [status, id, req.user?.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or you do not have permission' })
    }

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error updating application:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== SAVED JOBS ROUTES ====================

// Get saved jobs for current job seeker
app.get('/api/saved-jobs', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT sj.id, v.*, c.name as company_name, c.logo as company_logo
       FROM saved_jobs sj
       JOIN vacancies v ON sj.vacancy_id = v.id
       JOIN companies c ON v.company_id = c.id
       JOIN job_seekers js ON sj.job_seeker_id = js.id
       WHERE js.user_id = $1
       ORDER BY sj.created_at DESC`,
      [req.user?.id]
    )

    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error)
    res.status(500).json({ error: error.message })
  }
})

// Save/unsave job for current job seeker
app.post('/api/saved-jobs/:vacancyId', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const { vacancyId } = req.params

    // Get job seeker id
    const jobSeekerResult = await pool.query(
      'SELECT id FROM job_seekers WHERE user_id = $1',
      [req.user?.id]
    )

    if (jobSeekerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' })
    }

    const job_seeker_id = jobSeekerResult.rows[0].id

    const exists = await pool.query(
      'SELECT id FROM saved_jobs WHERE job_seeker_id = $1 AND vacancy_id = $2',
      [job_seeker_id, vacancyId]
    )

    if (exists.rows.length > 0) {
      // Delete if exists
      await pool.query('DELETE FROM saved_jobs WHERE job_seeker_id = $1 AND vacancy_id = $2', [job_seeker_id, vacancyId])
      res.json({ saved: false })
    } else {
      // Create if not exists
      await pool.query(
        'INSERT INTO saved_jobs (job_seeker_id, vacancy_id) VALUES ($1, $2)',
        [job_seeker_id, vacancyId]
      )
      res.json({ saved: true })
    }
  } catch (error: any) {
    console.error('Error toggling saved job:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== COMPANIES ROUTES ====================

// Get company details
app.get('/api/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM vacancies WHERE company_id = c.id AND is_active = true) as active_vacancies
       FROM companies c
       WHERE c.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error fetching company:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update company profile (employer only)
app.put('/api/companies/profile', authenticateToken, authorizeRoles('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, website, location, industry, employee_count } = req.body

    const result = await pool.query(
      `UPDATE companies 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           website = COALESCE($3, website),
           location = COALESCE($4, location),
           industry = COALESCE($5, industry),
           employee_count = COALESCE($6, employee_count),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING *`,
      [name, description, website, location, industry, employee_count, req.user?.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company profile not found' })
    }

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error updating company:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== JOB SEEKER ROUTES ====================

// Update job seeker profile
app.put('/api/job-seeker/profile', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, bio, location, experience_years, skills } = req.body

    const result = await pool.query(
      `UPDATE job_seekers 
       SET title = COALESCE($1, title),
           bio = COALESCE($2, bio),
           location = COALESCE($3, location),
           experience_years = COALESCE($4, experience_years),
           skills = COALESCE($5, skills),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING *`,
      [title, bio, location, experience_years, skills, req.user?.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' })
    }

    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error updating job seeker profile:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== RESUMES ROUTES ====================

// Get resumes for current job seeker
app.get('/api/resumes', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.* 
       FROM resumes r
       JOIN job_seekers js ON r.job_seeker_id = js.id
       WHERE js.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user?.id]
    )

    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching resumes:', error)
    res.status(500).json({ error: error.message })
  }
})

// Add resume
app.post('/api/resumes', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, file_url } = req.body

    const jobSeekerResult = await pool.query(
      'SELECT id FROM job_seekers WHERE user_id = $1',
      [req.user?.id]
    )

    if (jobSeekerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job seeker profile not found' })
    }

    const job_seeker_id = jobSeekerResult.rows[0].id

    const result = await pool.query(
      `INSERT INTO resumes (job_seeker_id, title, file_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [job_seeker_id, title, file_url]
    )

    res.status(201).json(result.rows[0])
  } catch (error: any) {
    console.error('Error adding resume:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete resume
app.delete('/api/resumes/:id', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `DELETE FROM resumes 
       WHERE id = $1 AND job_seeker_id IN (
         SELECT id FROM job_seekers WHERE user_id = $2
       )
       RETURNING id`,
      [id, req.user?.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found or you do not have permission' })
    }

    res.json({ message: 'Resume deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting resume:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== EMPLOYER VACANCIES ====================

// Get employer's own vacancies
app.get('/api/employer/vacancies', authenticateToken, authorizeRoles('employer'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT v.* FROM vacancies v
       JOIN companies c ON v.company_id = c.id
       WHERE c.user_id = $1
       ORDER BY v.created_at DESC`,
      [req.user?.id]
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching employer vacancies:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== ALL COMPANIES ====================

app.get('/api/companies', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM vacancies WHERE company_id = c.id AND is_active = true) as active_vacancies
       FROM companies c ORDER BY c.created_at DESC`
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== ADMIN ROUTES ====================

// Get admin statistics
app.get('/api/admin/stats', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const [usersResult, companiesResult, vacanciesResult, applicationsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM companies'),
      pool.query('SELECT COUNT(*) as count FROM vacancies'),
      pool.query('SELECT COUNT(*) as count FROM applications'),
    ])

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalCompanies: parseInt(companiesResult.rows[0].count),
      totalVacancies: parseInt(vacanciesResult.rows[0].count),
      totalApplications: parseInt(applicationsResult.rows[0].count),
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.created_at, u.phone
       FROM users u ORDER BY u.created_at DESC`
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM users WHERE id = $1', [id])
    res.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get all vacancies (admin only)
app.get('/api/admin/vacancies', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT v.*, c.name as company_name
       FROM vacancies v JOIN companies c ON v.company_id = c.id
       ORDER BY v.created_at DESC`
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching admin vacancies:', error)
    res.status(500).json({ error: error.message })
  }
})

// Toggle vacancy status (admin only)
app.put('/api/admin/vacancies/:id', authenticateToken, authorizeRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { is_active } = req.body
    const result = await pool.query(
      'UPDATE vacancies SET is_active = $1 WHERE id = $2 RETURNING *',
      [is_active, id]
    )
    res.json(result.rows[0])
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Check if current job seeker has applied to a vacancy
app.get('/api/applications/check/:vacancyId', authenticateToken, authorizeRoles('job_seeker'), async (req: AuthRequest, res: Response) => {
  try {
    const { vacancyId } = req.params
    const result = await pool.query(
      `SELECT a.id, a.status FROM applications a
       JOIN job_seekers js ON a.job_seeker_id = js.id
       WHERE js.user_id = $1 AND a.vacancy_id = $2`,
      [req.user?.id, vacancyId]
    )
    if (result.rows.length > 0) {
      res.json({ applied: true, status: result.rows[0].status, application_id: result.rows[0].id })
    } else {
      res.json({ applied: false })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get conversation between current user and another user
app.get('/api/messages/conversation/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const result = await pool.query(
      `SELECT m.*,
              sender.first_name as sender_first_name, sender.last_name as sender_last_name,
              recipient.first_name as recipient_first_name, recipient.last_name as recipient_last_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC`,
      [req.user?.id, userId]
    )
    res.json(result.rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get list of conversation partners
app.get('/api/messages/contacts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (partner_id) partner_id,
              partner_name, partner_role, last_message, last_time, unread_count
       FROM (
         SELECT 
           CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END as partner_id,
           CASE WHEN m.sender_id = $1 
             THEN (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = m.recipient_id)
             ELSE (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = m.sender_id)
           END as partner_name,
           CASE WHEN m.sender_id = $1
             THEN (SELECT role FROM users WHERE id = m.recipient_id)
             ELSE (SELECT role FROM users WHERE id = m.sender_id)
           END as partner_role,
           m.content as last_message,
           m.created_at as last_time,
           (SELECT COUNT(*) FROM messages WHERE sender_id != $1 AND recipient_id = $1 
            AND sender_id = CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END
            AND is_read = false) as unread_count
         FROM messages m
         WHERE m.sender_id = $1 OR m.recipient_id = $1
         ORDER BY m.created_at DESC
       ) sub
       ORDER BY partner_id, last_time DESC`,
      [req.user?.id]
    )
    res.json(result.rows)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== MESSAGES ROUTES ====================

// Get messages for current user (both sent and received)
app.get('/api/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
              sender.first_name as sender_first_name, sender.last_name as sender_last_name,
              recipient.first_name as recipient_first_name, recipient.last_name as recipient_last_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY m.created_at DESC`,
      [req.user?.id]
    )
    res.json(result.rows)
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: error.message })
  }
})

// Send a message
app.post('/api/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipient_id, title, content } = req.body

    if (!recipient_id || !content) {
      return res.status(400).json({ error: 'recipient_id and content are required' })
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user?.id, recipient_id, title, content]
    )
    res.status(201).json(result.rows[0])
  } catch (error: any) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: error.message })
  }
})

// Mark message as read
app.put('/api/messages/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE messages SET is_read = true
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, req.user?.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' })
    }
    res.json(result.rows[0])
  } catch (error: any) {
    console.error('Error marking message read:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== HEALTH CHECK ====================

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()')
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    })
  } catch (error: any) {
    console.error('[Health Check] Database error:', error)
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    })
  }
})

// Error handling middleware (must be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    stack: err.stack,
  })
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  })
})

// Start server
const server = app.listen(port, () => {
  console.log(`[API Server] ✓ Running on http://localhost:${port}`)
  console.log(`[API Server] ✓ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`[API Server] ✓ Database: ${process.env.DATABASE_URL ? 'configured' : 'NOT CONFIGURED'}`)
  console.log(`[API Server] ✓ Health check: http://localhost:${port}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[API Server] SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('[API Server] Server closed')
    pool.end()
    process.exit(0)
  })
})