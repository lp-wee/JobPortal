-- Seed test data for JobPortal

-- Clear existing data (optional)
TRUNCATE TABLE users, companies, job_seekers, vacancies, resumes, applications, saved_jobs, messages, reviews CASCADE;

-- ==================== USERS ====================

-- Admin user
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
('admin@jobportal.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'admin', 'Admin', 'User');

-- Company users (employers)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES
('tech@techcorp.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'employer', 'John', 'Smith', '+1-555-0101'),
('cloud@cloudbase.io', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'employer', 'Sarah', 'Johnson', '+1-555-0102'),
('data@datavision.ai', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'employer', 'Michael', 'Chen', '+1-555-0103'),
('secure@securenet.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'employer', 'Emma', 'Brown', '+1-555-0104'),
('design@designstudio.co', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'employer', 'David', 'Wilson', '+1-555-0105');

-- Job seeker users
INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES
('alice@gmail.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'job_seeker', 'Alice', 'Thompson', '+1-555-0201'),
('bob@gmail.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'job_seeker', 'Bob', 'Martinez', '+1-555-0202'),
('carol@gmail.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'job_seeker', 'Carol', 'Anderson', '+1-555-0203'),
('david@gmail.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'job_seeker', 'David', 'Taylor', '+1-555-0204'),
('emma@gmail.com', '$2y$10$5778Z2rM4clTrrVCq7QiD.zg8Ijq3UFjtTmkttkqH6OzpvpW3YYKe', 'job_seeker', 'Emma', 'Davis', '+1-555-0205');

-- ==================== COMPANIES ====================

INSERT INTO companies (user_id, name, description, logo, website, location, industry, employee_count, rating) VALUES
(2, 'TechCorp Solutions', 'Leading software development company specializing in web and mobile applications', '💻', 'techcorp.com', 'San Francisco, CA', 'Technology', 500, 4.8),
(3, 'CloudBase Inc', 'Cloud infrastructure and DevOps solutions provider', '☁️', 'cloudbase.io', 'New York, NY', 'Cloud Computing', 250, 4.6),
(4, 'DataVision Analytics', 'AI and Machine Learning solutions for enterprise', '📊', 'datavision.ai', 'Boston, MA', 'AI/ML', 180, 4.7),
(5, 'SecureNet Systems', 'Cybersecurity and advanced security solutions', '🔐', 'securenet.com', 'Austin, TX', 'Cybersecurity', 320, 4.5),
(6, 'DesignStudio Creative', 'UI/UX and digital design agency', '🎨', 'designstudio.co', 'Los Angeles, CA', 'Design', 150, 4.9);

-- ==================== JOB SEEKERS ====================

INSERT INTO job_seekers (user_id, title, bio, location, experience_years, skills) VALUES
(7, 'Senior React Developer', 'Passionate about building scalable web applications with modern technologies', 'San Francisco, CA', 8, ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL']),
(8, 'Full Stack JavaScript Developer', 'Experienced in MERN stack development with focus on performance', 'New York, NY', 6, ARRAY['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS']),
(9, 'Data Scientist', 'ML specialist with background in Python and statistical analysis', 'Boston, MA', 5, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics']),
(10, 'DevOps Engineer', 'Cloud infrastructure expert with Kubernetes and Docker experience', 'Austin, TX', 7, ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD']),
(11, 'UX/UI Designer', 'Creative designer focused on user-centered design and accessibility', 'Los Angeles, CA', 4, ARRAY['Figma', 'UI Design', 'UX Research', 'Prototyping', 'CSS']);

-- ==================== VACANCIES ====================

INSERT INTO vacancies (company_id, title, description, salary_min, salary_max, currency, employment_type, experience_level, location, industry, skills_required, applications_count, views_count) VALUES
(1, 'Senior React Developer', 'We are looking for an experienced React developer to join our frontend team. You will work on building scalable web applications with modern technologies. Requirements: 5+ years experience, TypeScript proficiency, testing expertise.', 120000, 160000, 'USD', 'full_time', 'senior', 'San Francisco, CA', 'Technology', ARRAY['React', 'TypeScript', 'Testing', 'Performance'], 12, 145),
(1, 'Backend Engineer - Node.js', 'Build and maintain our API backend using Node.js and PostgreSQL. You will be responsible for system design, performance optimization, and code quality.', 100000, 140000, 'USD', 'full_time', 'mid', 'San Francisco, CA', 'Technology', ARRAY['Node.js', 'PostgreSQL', 'API Design', 'System Design'], 8, 98),
(2, 'Cloud Infrastructure Engineer', 'Looking for a DevOps engineer to design and manage our cloud infrastructure on AWS. Experience with Kubernetes, Terraform, and CI/CD pipelines required.', 110000, 150000, 'USD', 'full_time', 'mid', 'New York, NY', 'Cloud Computing', ARRAY['Kubernetes', 'AWS', 'Terraform', 'Docker'], 5, 67),
(2, 'Solutions Architect', 'Join our team as a Solutions Architect to design cloud solutions for enterprise clients. You will work with AWS, Azure, and GCP.', 130000, 170000, 'USD', 'full_time', 'senior', 'New York, NY', 'Cloud Computing', ARRAY['Cloud Architecture', 'AWS', 'System Design'], 3, 42),
(3, 'Machine Learning Engineer', 'Develop ML models and algorithms for our data platform. Strong background in Python, TensorFlow, and statistical analysis required.', 115000, 155000, 'USD', 'full_time', 'mid', 'Boston, MA', 'AI/ML', ARRAY['Machine Learning', 'Python', 'TensorFlow'], 7, 89),
(3, 'Data Engineer', 'Build scalable data pipelines and data warehouses. Experience with Apache Spark, Airflow, and data modeling required.', 105000, 145000, 'USD', 'full_time', 'mid', 'Boston, MA', 'AI/ML', ARRAY['Apache Spark', 'SQL', 'Data Warehousing'], 4, 56),
(4, 'Security Engineer', 'Protect our systems and infrastructure from security threats. You will work on security architecture, penetration testing, and vulnerability management.', 120000, 160000, 'USD', 'full_time', 'senior', 'Austin, TX', 'Cybersecurity', ARRAY['Security Architecture', 'Penetration Testing', 'System Security'], 2, 38),
(4, 'Junior Security Analyst', 'Start your cybersecurity career with us. You will monitor systems, analyze logs, and help respond to security incidents.', 60000, 85000, 'USD', 'full_time', 'entry', 'Austin, TX', 'Cybersecurity', ARRAY['Network Security', 'Log Analysis', 'Security Monitoring'], 15, 125),
(5, 'Senior UI/UX Designer', 'Lead design for our web and mobile applications. You will work on user research, wireframing, prototyping, and design systems.', 95000, 130000, 'USD', 'full_time', 'senior', 'Los Angeles, CA', 'Design', ARRAY['Figma', 'User Research', 'Design Systems'], 6, 72),
(5, 'Product Designer', 'Join our product team to design delightful user experiences. Collaborate with product managers and engineers to create innovative solutions.', 85000, 115000, 'USD', 'full_time', 'mid', 'Los Angeles, CA', 'Design', ARRAY['Product Design', 'Figma', 'Prototyping'], 9, 103);

-- ==================== RESUMES ====================

INSERT INTO resumes (job_seeker_id, title, file_url) VALUES
(1, 'React Developer Resume 2024', 'https://example.com/alice-resume.pdf'),
(1, 'Full Stack Developer Resume', 'https://example.com/alice-fullstack.pdf'),
(2, 'JavaScript Developer Resume', 'https://example.com/bob-resume.pdf'),
(3, 'Data Science Resume', 'https://example.com/carol-resume.pdf'),
(4, 'DevOps Engineer Resume', 'https://example.com/david-resume.pdf'),
(5, 'UX Designer Resume', 'https://example.com/emma-resume.pdf');

-- ==================== APPLICATIONS ====================

INSERT INTO applications (vacancy_id, job_seeker_id, resume_id, status, cover_letter) VALUES
(1, 1, 1, 'pending', 'I am very interested in this position. With 8 years of React experience, I am confident I can contribute significantly to your team.'),
(1, 2, 3, 'reviewing', 'I believe my MERN stack expertise makes me a great fit for this senior role.'),
(2, 2, 3, 'pending', 'My Node.js and PostgreSQL experience align perfectly with this backend role.'),
(3, 4, 5, 'accepted', 'I have extensive experience with Kubernetes and AWS infrastructure.'),
(4, 4, 5, 'pending', 'Looking forward to architecting cloud solutions for your enterprise clients.'),
(5, 3, 4, 'reviewing', 'My machine learning background and Python expertise make me suitable for this role.'),
(6, 3, 4, 'pending', 'I have strong experience building data pipelines with Spark.'),
(7, 1, 1, 'pending', 'While primarily a frontend dev, I have security knowledge from my previous role.'),
(9, 5, 6, 'accepted', 'Excited to lead design initiatives and create beautiful user experiences.'),
(10, 5, 6, 'pending', 'My product design background aligns with your team needs.');

-- ==================== SAVED JOBS ====================

INSERT INTO saved_jobs (job_seeker_id, vacancy_id) VALUES
(1, 1),
(1, 2),
(1, 5),
(2, 2),
(2, 6),
(3, 5),
(3, 6),
(4, 3),
(4, 4),
(5, 9),
(5, 10);

-- ==================== MESSAGES ====================

INSERT INTO messages (sender_id, recipient_id, title, content, is_read) VALUES
(2, 7, 'Regarding Your Application', 'Hi Alice, we are impressed with your application for the Senior React Developer position. We would like to schedule an interview.', true),
(7, 2, 'Re: Regarding Your Application', 'Thank you for reaching out! I am very interested in this opportunity and available for an interview next week.', true),
(3, 8, 'Interview Scheduled', 'Hi Bob, your interview for the Cloud Infrastructure Engineer position is scheduled for March 15th at 10:00 AM.', false),
(4, 4, 'Congratulations', 'Hi David, we are pleased to offer you the position of Solutions Architect. Please review the offer letter attached.', false),
(5, 11, 'Design Feedback', 'Emma, great work on the UI mockups. Let''s schedule a design review meeting to discuss refinements.', true);

-- ==================== REVIEWS ====================

INSERT INTO reviews (company_id, job_seeker_id, reviewer_id, rating, comment) VALUES
(1, NULL, 8, 5, 'TechCorp is an amazing company to work for. Great team culture and learning opportunities!'),
(2, NULL, 1, 4, 'CloudBase has modern tech stack and supportive management. Highly recommended.'),
(NULL, 2, 2, 5, 'Bob is a fantastic developer with great communication skills. Highly professional.'),
(3, NULL, 3, 5, 'DataVision is at the forefront of AI innovation. Proud to work here.'),
(4, NULL, 4, 4, 'SecureNet has a strong security-first culture. Would recommend to others.'),
(NULL, 5, 6, 5, 'Emma''s design work is exceptional. Great attention to detail and user empathy.');

-- ==================== VERIFY DATA ====================

-- Check users count
SELECT COUNT(*) as total_users FROM users;

-- Check vacancies count
SELECT COUNT(*) as total_vacancies FROM vacancies;

-- Check companies count
SELECT COUNT(*) as total_companies FROM companies;

-- Sample query: Active vacancies by company
SELECT c.name, COUNT(v.id) as vacancy_count
FROM companies c
LEFT JOIN vacancies v ON c.id = v.company_id AND v.is_active = true
GROUP BY c.id, c.name
ORDER BY vacancy_count DESC;
