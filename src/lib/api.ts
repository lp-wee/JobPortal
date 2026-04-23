import { supabase } from '@/integrations/supabase/client';
import type { Profile, Vacancy, Application, Resume, Message, Company, Service, UserService, ApplicationStatus, VerificationStatus } from './types';

// ===== PROFILES =====
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: { first_name?: string; last_name?: string; phone?: string; bio?: string; company_name?: string }): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('user_id', userId).select().single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []) as Profile[];
}

export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function blockUser(userId: string, blocked: boolean): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_blocked: blocked } as any).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function deleteUser(userId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const resp = await supabase.functions.invoke('delete-user', { body: { userId } });
  if (resp.error) throw new Error(resp.error.message || 'Failed to delete user');
  if (resp.data?.error) throw new Error(resp.data.error);
}

// ===== COMPANIES =====
export async function getCompanies(): Promise<Company[]> {
  const { data: companies } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
  if (!companies) return [];
  const { data: vacancies } = await supabase.from('vacancies').select('company_id').eq('is_active', true);
  return (companies as Company[]).map(c => ({
    ...c,
    active_vacancies: (vacancies || []).filter(v => v.company_id === c.id).length,
  }));
}

export async function getCompanyByUserId(userId: string): Promise<Company | null> {
  const { data } = await supabase.from('companies').select('*').eq('user_id', userId).single();
  return data as Company | null;
}

export async function upsertCompany(userId: string, updates: { name: string; description?: string; location?: string; industry?: string; website?: string }): Promise<Company> {
  const existing = await getCompanyByUserId(userId);
  if (existing) {
    const { data, error } = await supabase.from('companies').update(updates).eq('id', existing.id).select().single();
    if (error) throw new Error(error.message);
    return data as Company;
  }
  const { data, error } = await supabase.from('companies').insert({ ...updates, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data as Company;
}

// ===== VACANCIES =====
async function enrichVacanciesWithProfiles(vacancies: any[]): Promise<Vacancy[]> {
  if (!vacancies || vacancies.length === 0) return [];
  const userIds = [...new Set(vacancies.map(v => v.user_id))];
  const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name, company_name').in('user_id', userIds);
  const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
  
  return vacancies.map((v: any) => {
    const prof = profileMap.get(v.user_id);
    return {
      id: v.id,
      user_id: v.user_id,
      company_id: v.company_id,
      title: v.title,
      description: v.description,
      salary_min: v.salary_min,
      salary_max: v.salary_max,
      currency: v.currency,
      employment_type: v.employment_type,
      experience_level: v.experience_level,
      location: v.location,
      industry: v.industry,
      skills_required: v.skills_required || [],
      is_active: v.is_active,
      views_count: v.views_count,
      created_at: v.created_at,
      updated_at: v.updated_at,
      company_name: v.companies?.name || prof?.company_name || prof?.first_name || '',
      employer_first_name: prof?.first_name,
      employer_last_name: prof?.last_name,
      applications_count: Array.isArray(v.applications) ? v.applications.length : 0,
    };
  });
}

export async function getVacancies(filters?: {
  search?: string;
  employmentType?: string;
  experienceLevel?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}): Promise<Vacancy[]> {
  let query = supabase.from('vacancies').select(`
    *,
    companies(name),
    applications(id)
  `).eq('is_active', true).order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters?.employmentType) {
    query = query.in('employment_type', filters.employmentType.split(','));
  }
  if (filters?.experienceLevel) {
    query = query.in('experience_level', filters.experienceLevel.split(','));
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.salaryMin) {
    query = query.gte('salary_max', filters.salaryMin);
  }
  if (filters?.salaryMax) {
    query = query.lte('salary_min', filters.salaryMax);
  }

  const { data } = await query;
  return enrichVacanciesWithProfiles(data);
}

export async function getVacancy(id: string): Promise<Vacancy | null> {
  const { data } = await supabase.from('vacancies').select(`
    *,
    companies(name),
    applications(id)
  `).eq('id', id).single();
  if (!data) return null;
  const enriched = await enrichVacanciesWithProfiles([data]);
  return enriched[0] || null;
}

export async function getEmployerVacancies(userId: string): Promise<Vacancy[]> {
  const { data } = await supabase.from('vacancies').select(`
    *,
    companies(name),
    applications(id)
  `).eq('user_id', userId).order('created_at', { ascending: false });
  return enrichVacanciesWithProfiles(data);
}

export async function getAllVacancies(): Promise<Vacancy[]> {
  const { data } = await supabase.from('vacancies').select(`
    *,
    companies(name),
    applications(id)
  `).order('created_at', { ascending: false });
  return enrichVacanciesWithProfiles(data);
}

export async function createVacancy(v: {
  user_id: string;
  company_id?: string;
  title: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  experience_level: string;
  location?: string;
  industry?: string;
  skills_required?: string[];
}): Promise<Vacancy> {
  const { data, error } = await supabase.from('vacancies').insert({
    user_id: v.user_id,
    company_id: v.company_id || null,
    title: v.title,
    description: v.description,
    salary_min: v.salary_min || null,
    salary_max: v.salary_max || null,
    employment_type: v.employment_type,
    experience_level: v.experience_level,
    location: v.location || null,
    industry: v.industry || null,
    skills_required: v.skills_required || [],
  }).select().single();
  if (error) throw new Error(error.message);
  return data as Vacancy;
}

export async function updateVacancy(id: string, updates: {
  title?: string;
  description?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  employment_type?: string;
  experience_level?: string;
  location?: string | null;
  industry?: string | null;
  skills_required?: string[];
  is_active?: boolean;
}): Promise<Vacancy> {
  const { data, error } = await supabase.from('vacancies').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Vacancy;
}

export async function toggleVacancyActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('vacancies').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteVacancy(id: string): Promise<void> {
  const { error } = await supabase.from('vacancies').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ===== APPLICATIONS =====
export async function getApplications(filters?: {
  vacancy_id?: string;
  user_id?: string;
  employer_user_id?: string;
}): Promise<Application[]> {
  if (filters?.employer_user_id) {
    const { data: vacancies } = await supabase.from('vacancies').select('id, title').eq('user_id', filters.employer_user_id);
    const vacIds = (vacancies || []).map(v => v.id);
    if (vacIds.length === 0) return [];
    const vacMap = Object.fromEntries((vacancies || []).map(v => [v.id, v.title]));
    const { data } = await supabase.from('applications').select('*').in('vacancy_id', vacIds).order('created_at', { ascending: false });
    // Enrich with profile data
    const userIds = [...new Set((data || []).map((a: any) => a.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds);
    const profMap = new Map((profiles || []).map(p => [p.user_id, p]));
    return (data || []).map((a: any) => ({
      ...a,
      vacancy_title: vacMap[a.vacancy_id] || '',
      first_name: profMap.get(a.user_id)?.first_name || '',
      last_name: profMap.get(a.user_id)?.last_name || '',
    }));
  }

  let query = supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (filters?.vacancy_id) query = query.eq('vacancy_id', filters.vacancy_id);
  if (filters?.user_id) query = query.eq('user_id', filters.user_id);

  const { data } = await query;
  // Enrich with vacancy titles and profile names
  const vacIds = [...new Set((data || []).map((a: any) => a.vacancy_id))];
  const userIds = [...new Set((data || []).map((a: any) => a.user_id))];
  
  const [{ data: vacancies }, { data: profiles }] = await Promise.all([
    vacIds.length > 0 ? supabase.from('vacancies').select('id, title').in('id', vacIds) : { data: [] },
    userIds.length > 0 ? supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds) : { data: [] },
  ]);
  
  const vacMap = new Map((vacancies || []).map((v: any) => [v.id, v.title]));
  const profMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
  
  return (data || []).map((a: any) => ({
    ...a,
    vacancy_title: vacMap.get(a.vacancy_id) || '',
    first_name: profMap.get(a.user_id)?.first_name || '',
    last_name: profMap.get(a.user_id)?.last_name || '',
  }));
}

export async function getAllApplications(): Promise<Application[]> {
  const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  const vacIds = [...new Set((data || []).map((a: any) => a.vacancy_id))];
  const userIds = [...new Set((data || []).map((a: any) => a.user_id))];
  const [{ data: vacancies }, { data: profiles }] = await Promise.all([
    vacIds.length > 0 ? supabase.from('vacancies').select('id, title').in('id', vacIds) : { data: [] },
    userIds.length > 0 ? supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', userIds) : { data: [] },
  ]);
  const vacMap = new Map((vacancies || []).map((v: any) => [v.id, v.title]));
  const profMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
  return (data || []).map((a: any) => ({
    ...a,
    vacancy_title: vacMap.get(a.vacancy_id) || '',
    first_name: profMap.get(a.user_id)?.first_name || '',
    last_name: profMap.get(a.user_id)?.last_name || '',
  }));
}

export async function getApplicationForVacancy(vacancyId: string, userId: string): Promise<Application | null> {
  const { data } = await supabase.from('applications').select('*').eq('vacancy_id', vacancyId).eq('user_id', userId).maybeSingle();
  return data as Application | null;
}

export async function createApplication(vacancyId: string, userId: string, coverLetter?: string): Promise<Application> {
  const { data, error } = await supabase.from('applications').insert({
    vacancy_id: vacancyId,
    user_id: userId,
    cover_letter: coverLetter || null,
  }).select().single();
  if (error) {
    if (error.code === '23505') throw new Error('Вы уже откликнулись на эту вакансию');
    throw new Error(error.message);
  }
  return data as Application;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
  const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Application;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ===== RESUMES =====
export async function getResumes(userId: string): Promise<Resume[]> {
  const { data } = await supabase.from('resumes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []) as Resume[];
}

export async function createResume(userId: string, title: string, fileName?: string, fileUrl?: string): Promise<Resume> {
  const { data, error } = await supabase.from('resumes').insert({
    user_id: userId,
    title,
    file_name: fileName || null,
    file_url: fileUrl || null,
  }).select().single();
  if (error) throw new Error(error.message);
  return data as Resume;
}

export async function deleteResume(id: string): Promise<void> {
  const { error } = await supabase.from('resumes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function uploadResumeFile(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('resumes').upload(path, file);
  if (error) throw new Error(error.message);
  // Use signed URL since bucket is private
  const { data, error: urlError } = await supabase.storage.from('resumes').createSignedUrl(path, 60 * 60 * 24 * 365);
  if (urlError) throw new Error(urlError.message);
  return data.signedUrl;
}

export async function getResumeDownloadUrl(fileUrl: string): Promise<string> {
  // If it's already a signed URL or external URL, return as-is
  if (fileUrl.includes('token=')) return fileUrl;
  // Extract path from public URL
  const match = fileUrl.match(/\/storage\/v1\/object\/public\/resumes\/(.+)/);
  if (match) {
    const { data, error } = await supabase.storage.from('resumes').createSignedUrl(match[1], 60 * 60);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  }
  return fileUrl;
}

export async function getResumesByApplicant(applicantUserId: string): Promise<Resume[]> {
  const { data } = await supabase.from('resumes').select('*').eq('user_id', applicantUserId).order('created_at', { ascending: false });
  return (data || []) as Resume[];
}

// ===== MESSAGES =====
export async function getMessages(userId: string): Promise<Message[]> {
  const { data } = await supabase.from('messages').select('*').or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order('created_at', { ascending: true });
  // Enrich with sender names
  const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
  const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', senderIds);
  const profMap = new Map((profiles || []).map(p => [p.user_id, `${p.first_name} ${p.last_name}`]));
  return (data || []).map((m: any) => ({
    ...m,
    sender_name: profMap.get(m.sender_id) || '',
  })) as Message[];
}

export async function getConversation(userId: string, otherUserId: string, vacancyId?: string): Promise<Message[]> {
  let query = supabase.from('messages').select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`);
  if (vacancyId) query = query.eq('vacancy_id', vacancyId);
  query = query.order('created_at', { ascending: true });
  const { data } = await query;
  const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
  const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', senderIds);
  const profMap = new Map((profiles || []).map(p => [p.user_id, `${p.first_name} ${p.last_name}`]));
  return (data || []).map((m: any) => ({
    ...m,
    sender_name: profMap.get(m.sender_id) || '',
  })) as Message[];
}

export async function sendMessage(senderId: string, recipientId: string, content: string, vacancyId?: string): Promise<Message> {
  const { data, error } = await supabase.from('messages').insert({
    sender_id: senderId,
    recipient_id: recipientId,
    content,
    vacancy_id: vacancyId || null,
  }).select().single();
  if (error) throw new Error(error.message);
  return data as Message;
}

export async function getContacts(userId: string): Promise<{ userId: string; name: string; lastMessage: string; vacancyId?: string }[]> {
  const msgs = await getMessages(userId);
  const profileIds = new Set<string>();
  msgs.forEach(m => { profileIds.add(m.sender_id === userId ? m.recipient_id : m.sender_id); });
  const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', Array.from(profileIds));
  const profileMap = new Map((profiles || []).map(p => [p.user_id, `${p.first_name} ${p.last_name}`]));
  const contactMap = new Map<string, { userId: string; name: string; lastMessage: string; vacancyId?: string }>();
  msgs.forEach(m => {
    const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id;
    const key = `${otherId}-${m.vacancy_id || '0'}`;
    contactMap.set(key, { userId: otherId, name: profileMap.get(otherId) || 'Неизвестный', lastMessage: m.content, vacancyId: m.vacancy_id || undefined });
  });
  return Array.from(contactMap.values());
}

// ===== SAVED VACANCIES =====
export async function getSavedVacancies(userId: string): Promise<Vacancy[]> {
  const { data } = await supabase.from('saved_vacancies').select('vacancy_id').eq('user_id', userId);
  if (!data || data.length === 0) return [];
  const vacIds = data.map(sv => sv.vacancy_id);
  const { data: vacData } = await supabase.from('vacancies').select(`
    *,
    companies(name),
    applications(id)
  `).in('id', vacIds);
  return enrichVacanciesWithProfiles(vacData);
}

export async function saveVacancy(userId: string, vacancyId: string): Promise<void> {
  const { error } = await supabase.from('saved_vacancies').insert({ user_id: userId, vacancy_id: vacancyId });
  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function unsaveVacancy(userId: string, vacancyId: string): Promise<void> {
  await supabase.from('saved_vacancies').delete().eq('user_id', userId).eq('vacancy_id', vacancyId);
}

export async function isVacancySaved(userId: string, vacancyId: string): Promise<boolean> {
  const { data } = await supabase.from('saved_vacancies').select('id').eq('user_id', userId).eq('vacancy_id', vacancyId).maybeSingle();
  return !!data;
}

// ===== SERVICES =====
export async function getServices(): Promise<Service[]> {
  const { data } = await supabase.from('services').select('*').eq('is_active', true).order('price', { ascending: true });
  return (data || []) as Service[];
}

export async function purchaseService(userId: string, serviceId: string, durationDays: number): Promise<UserService> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  const { data, error } = await supabase.from('user_services').insert({
    user_id: userId,
    service_id: serviceId,
    expires_at: expiresAt.toISOString(),
  }).select().single();
  if (error) throw new Error(error.message);
  return data as UserService;
}

export async function getUserServices(userId: string): Promise<UserService[]> {
  const { data } = await supabase.from('user_services').select(`*, services(*)`).eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map((us: any) => ({ ...us, service: us.services, services: undefined })) as UserService[];
}

// ===== ADMIN =====
export async function getAdminStats() {
  const [{ count: users }, { count: vacancies }, { count: applications }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vacancies').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
  ]);
  const { data: allV } = await supabase.from('vacancies').select('is_active');
  return {
    users: users || 0,
    vacancies: vacancies || 0,
    applications: applications || 0,
    activeVacancies: (allV || []).filter(v => v.is_active).length,
  };
}

// ===== VERIFICATION =====
export async function uploadVerificationDoc(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('verification-docs').upload(path, file);
  if (error) throw new Error(error.message);
  return path;
}

export async function submitVerification(userId: string, docPath: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({
    verification_doc_url: docPath,
    verification_status: 'pending',
  }).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function getVerificationDocUrl(docPath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('verification-docs').createSignedUrl(docPath, 60 * 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function approveVerification(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({
    verification_status: 'approved',
    is_verified: true,
  }).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function rejectVerification(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({
    verification_status: 'rejected',
    is_verified: false,
    verification_doc_url: null,
  }).eq('user_id', userId);
  if (error) throw new Error(error.message);
}
