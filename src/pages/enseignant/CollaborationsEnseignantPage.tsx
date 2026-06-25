import { BookOpen, Loader2, MessageSquare } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { getCollaborationsAsTeacher } from '@/lib/api';
import { supabase } from '@/db/supabase';
import type { DbCollaboration } from '@/db/supabase';

type CollabWithStudent = DbCollaboration & { studentName?: string; studentEmoji?: string };

export default function CollaborationsEnseignantPage() {
  const { user }  = useApp();
  const navigate  = useNavigate();
  const [collabs, setCollabs] = useState<CollabWithStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const cs = await getCollaborationsAsTeacher(user.id);
        const withStudents = await Promise.all(
          cs.map(async c => {
            try {
              const { data } = await supabase.from('profiles').select('name, avatar_url').eq('id', c.student_id).maybeSingle();
              return { ...c, studentName: data?.name ?? 'Étudiant', studentEmoji: data?.avatar_url ?? '👨‍🎓' };
            } catch { return { ...c, studentName: 'Étudiant', studentEmoji: '👨‍🎓' }; }
          })
        );
        setCollabs(withStudents);
      } catch { /* offline */ }
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <>
      <SEO title="Mes collaborations — Espace Enseignant" description="Accédez aux espaces de travail partagés avec vos étudiants." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Mes collaborations</h1>
          <p className="text-muted-foreground mt-1 text-sm text-pretty">
            Espaces de travail actifs avec vos étudiants accompagnés.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : collabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Aucune collaboration active</p>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Les espaces de travail apparaîtront ici après avoir accepté des demandes d'accompagnement.
            </p>
            <Button variant="outline" onClick={() => navigate('/espace-enseignant/demandes')}>
              Voir les demandes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collabs.map(c => (
              <Card
                key={c.id}
                className="h-full flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/espace-collaboration/${c.id}`)}
              >
                <CardContent className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-11 h-11 shrink-0 border border-border">
                      <AvatarFallback className="bg-secondary text-2xl">
                        {c.studentEmoji || '👨‍🎓'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{c.studentName || 'Étudiant'}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-success/15 text-success border border-success/30 rounded-full text-xs font-medium shrink-0">
                      Actif
                    </span>
                  </div>

                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium w-fit">{c.subject}</span>

                  <p className="text-xs text-muted-foreground">
                    Débuté le {new Date(c.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>

                  <Button size="sm" type="button" className="mt-auto h-9" onClick={() => navigate(`/espace-collaboration/${c.id}`)}>
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Ouvrir l'espace
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
