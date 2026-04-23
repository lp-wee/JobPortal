
-- Create missing trigger for role sync
CREATE TRIGGER on_profile_role_sync
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

-- Seed services
INSERT INTO public.services (name, description, duration_days, features, price, currency, target_role, is_active)
SELECT * FROM (VALUES
  ('VIP размещение вакансии', 'Поднятие вакансии в топе списка и выделение в поиске.', 30, ARRAY['Приоритет в выдаче','Выделение карточки','Больше просмотров']::text[], 149000::numeric, 'UZS', 'employer'::public.app_role, true),
  ('Срочный подбор', 'Ускоренное привлечение кандидатов на ключевые позиции.', 14, ARRAY['Приоритетный отклик','Быстрый показ соискателям','Отдельная метка']::text[], 249000::numeric, 'UZS', 'employer'::public.app_role, true),
  ('Премиум резюме', 'Выделение резюме для работодателей и больше шансов на приглашение.', 30, ARRAY['Выше в результатах','Премиум бейдж','Больше откликов']::text[], 89000::numeric, 'UZS', 'job_seeker'::public.app_role, true),
  ('Карьерный буст', 'Продвижение профиля соискателя на платформе.', 21, ARRAY['Показы работодателям','Приоритет в поиске','Усиленная видимость']::text[], 119000::numeric, 'UZS', 'job_seeker'::public.app_role, true)
) AS v(name, description, duration_days, features, price, currency, target_role, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.services s WHERE s.name = v.name);
