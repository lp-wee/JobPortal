import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { getApplications } from '@/lib/api';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants';
import { Application } from '@/lib/types';

export default function CabinetApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  useEffect(() => { if (user) getApplications({ user_id: user.id }).then(setApplications); }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Мои отклики</h1>
      {applications.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">У вас пока нет откликов</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id} className="border-none shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-foreground">{app.vacancy_title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Отклик от {new Date(app.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <span className={`text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap self-start ${APPLICATION_STATUS_COLORS[app.status]}`}>
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
