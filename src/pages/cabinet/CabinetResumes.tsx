import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getResumes, createResume, deleteResume, uploadResumeFile, getResumeDownloadUrl } from '@/lib/api';
import { Resume } from '@/lib/types';
import { FileText, Plus, Trash2, Upload, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CabinetResumes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewResume, setViewResume] = useState<Resume | null>(null);

  const load = async () => { if (user) setResumes(await getResumes(user.id)); };
  useEffect(() => { load(); }, [user]);

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    await createResume(user.id, title.trim(), `${title.trim().replace(/\s/g, '_')}.pdf`);
    setTitle(''); setShowForm(false); await load();
    toast({ title: 'Резюме добавлено' });
  };

  const handleDelete = async (id: string) => { await deleteResume(id); await load(); toast({ title: 'Резюме удалено' }); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { toast({ title: 'Ошибка', description: 'Допустимые форматы: .pdf, .docx', variant: 'destructive' }); return; }
    try {
      const fileUrl = await uploadResumeFile(user.id, file);
      await createResume(user.id, file.name.replace(/\.[^/.]+$/, ''), file.name, fileUrl);
      await load();
      toast({ title: 'Резюме загружено', description: file.name });
    } catch (err: any) {
      toast({ title: 'Ошибка загрузки', description: err.message, variant: 'destructive' });
    }
  };

  const handleDownload = async (resume: Resume) => {
    if (!resume.file_url) return;
    try {
      const url = await getResumeDownloadUrl(resume.file_url);
      window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black text-foreground">Мои резюме</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="rounded-xl font-bold"><Plus className="w-4 h-4 mr-2" />Создать</Button>
          <label>
            <Button variant="outline" className="rounded-xl font-bold cursor-pointer" asChild><span><Upload className="w-4 h-4 mr-2" />Загрузить файл</span></Button>
            <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
      {showForm && (
        <Card><CardContent className="p-4 flex gap-3">
          <Input placeholder="Название резюме" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
          <Button onClick={handleCreate} className="rounded-xl">Сохранить</Button>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Отмена</Button>
        </CardContent></Card>
      )}
      {resumes.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Резюме пока нет</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {resumes.map(r => (
            <Card key={r.id} className="border-none shadow-sm">
              <CardContent className="p-4 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">{r.title}</h3>
                    <p className="text-xs text-muted-foreground">{r.file_name || 'Без файла'} • {new Date(r.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setViewResume(r)} className="text-primary"><Eye className="w-4 h-4" /></Button>
                  {r.file_url && <Button variant="ghost" size="sm" onClick={() => handleDownload(r)} className="text-primary"><Download className="w-4 h-4" /></Button>}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewResume} onOpenChange={() => setViewResume(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{viewResume?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-12 h-12 text-primary" />
              <div>
                <p className="font-bold text-foreground">{viewResume?.title}</p>
                <p className="text-sm text-muted-foreground">{viewResume?.file_name || 'Без файла'}</p>
                <p className="text-xs text-muted-foreground">Создано: {viewResume?.created_at ? new Date(viewResume.created_at).toLocaleDateString('ru-RU') : ''}</p>
              </div>
            </div>
            {viewResume?.file_url && (
              <Button onClick={() => viewResume && handleDownload(viewResume)} className="w-full rounded-xl">
                <Download className="w-4 h-4 mr-2" />Скачать файл
              </Button>
            )}
            {viewResume?.content && <p className="text-sm text-muted-foreground whitespace-pre-line">{viewResume.content}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
