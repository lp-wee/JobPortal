export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Отклик отправлен',
  reviewing: 'Просмотрен',
  accepted: 'Принят',
  rejected: 'Отклонён',
};

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const EMPLOYMENT_TYPES: Record<string, string> = {
  full_time: 'Полная занятость',
  part_time: 'Неполная занятость',
  contract: 'Контракт',
  freelance: 'Фриланс',
  internship: 'Стажировка',
};

export const EXPERIENCE_LEVELS: Record<string, string> = {
  entry: 'Начальный уровень',
  mid: 'Средний уровень',
  senior: 'Старший специалист',
  lead: 'Руководитель',
};

export function formatSalary(min?: number, max?: number): string {
  const fmt = (n: number) => n.toLocaleString('ru-RU');
  if (min && max) return `${fmt(min)} – ${fmt(max)} UZS`;
  if (min) return `от ${fmt(min)} UZS`;
  if (max) return `до ${fmt(max)} UZS`;
  return 'Не указана';
}
