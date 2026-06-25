import {
  BookOpen, GraduationCap, Loader2, MessageSquare, Send,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { getCollaborationsAsStudent, getTeacherProfileByUserId } from '@/lib/api';
import type { DbCollaboration, DbTeacherProfile } from '@/db/supabase';

type CollabWithTeacher = DbCollaboration & { teacher?: DbTeacherProfile | null };

export default function MesCollaborationsPage() {
  const { user }  = useApp();
  const navigate  = useNavigate();
  const [collabs, setCollabs] = useState<CollabWithTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const cs = await getCollaborationsAsStudent(user.id);
        const withTeachers = await Promise.all(
          cs.map(async c => {
            try { return { ...c, teacher: await getTeacherProfileByUserId(c.teacher_id) }; }
            catch { return { ...c, teacher: null }; }
          })
        );
        setCollabs(withTeachers);
      } catch { /* offline */ }
      setLoading(false);
    })();
  }, [user?.id]);

  return (
    <>
      <SEO title="Mes collaborations — Apprenix" description="Accédez à vos espaces de travail partagés avec vos professeurs." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">Mes collaborations</h1>
            <p className="text-muted-foreground mt-1 text-sm text-pretty">
              Accédez à vos espaces de travail partagés avec vos professeurs.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/trouver-enseignant')} className="h-9 shrink-0">
            <Send className="w-4 h-4 mr-1.5" /> Trouver un prof
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : collabs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Aucune collaboration active</p>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Vos espaces de travail partagés apparaîtront ici dès qu'un professeur acceptera votre demande.
            </p>
            <Button onClick={() => navigate('/mes-demandes')}>
              Voir mes demandes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collabs.map(c => (
              <Card key={c.id} className="h-full flex flex-col hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/espace-collaboration/${c.id}`)}>
                <CardContent className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-11 h-11 shrink-0 border border-border">
                      <AvatarFallback className="bg-primary/10 text-2xl">
                        {c.teacher?.avatar_emoji || '👩‍🏫'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {c.teacher?.display_name || 'Professeur'}
                      </p>
                      {c.teacher?.institution && (
                        <p className="text-xs text-muted-foreground truncate">{c.teacher.institution}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 bg-success/15 text-success border border-success/30 rounded-full text-xs font-medium shrink-0">
                      Actif
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{c.subject}</span>
                  </div>

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
