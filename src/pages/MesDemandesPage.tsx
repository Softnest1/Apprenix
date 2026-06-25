import {
  CheckCircle, Clock, GraduationCap, Loader2, Send, Trash2, X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import {
  cancelAccompanimentRequest,
  getCollaborationByRequestId,
  getMyRequestsAsStudent,
  getTeacherProfileByUserId,
} from '@/lib/api';
import { supabase } from '@/db/supabase';
import type { DbAccompanimentRequest, DbTeacherProfile } from '@/db/supabase';

// ── Statut ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'En attente',  color: 'bg-warning/15 text-warning-foreground border-warning/30', icon: Clock },
  accepted:  { label: 'Acceptée',    color: 'bg-success/15 text-success border-success/30',            icon: CheckCircle },
  refused:   { label: 'Non retenue', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: X },
  cancelled: { label: 'Annulée',     color: 'bg-muted text-muted-foreground border-border',             icon: X },
};

type RequestWithTeacher = DbAccompanimentRequest & { teacher?: DbTeacherProfile | null };

// ── Carte demande ─────────────────────────────────────────────────────────────
function RequestCard({
  req, onCancel, onGoToCollab,
}: {
  req: RequestWithTeacher;
  onCancel: (id: string) => void;
  onGoToCollab: (req: RequestWithTeacher) => void;
}) {
  const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG['pending'];
  const Icon = cfg.icon;
  const teacher = req.teacher;

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0 border border-border">
            <AvatarFallback className="bg-primary/10 text-xl">
              {teacher?.avatar_emoji || '👩‍🏫'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {teacher?.display_name || 'Professeur'}
            </p>
            {teacher?.institution && (
              <p className="text-xs text-muted-foreground truncate">{teacher.institution}</p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Matière + message */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{req.subject}</span>
          </div>
          {req.message && (
            <p className="text-xs text-muted-foreground text-pretty line-clamp-2">{req.message}</p>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground">
          Envoyée le {new Date(req.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Actions */}
        <div className="mt-auto pt-1 flex gap-2">
          {req.status === 'accepted' && (
            <Button size="sm" className="flex-1 h-9 bg-success/90 hover:bg-success text-white" onClick={() => onGoToCollab(req)}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Espace de travail
            </Button>
          )}
          {req.status === 'pending' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 h-9 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Annuler
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler cette demande ?</AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-sm text-muted-foreground">
                  Votre demande auprès de {teacher?.display_name || 'ce professeur'} sera annulée.
                </p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Garder</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onCancel(req.id)}
                  >
                    Annuler la demande
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MesDemandesPage() {
  const { user } = useApp();
  const navigate  = useNavigate();
  const [requests, setRequests] = useState<RequestWithTeacher[]>([]);
  const [loading, setLoading]   = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const reqs = await getMyRequestsAsStudent(user.id);
      const withTeachers = await Promise.all(
        reqs.map(async r => {
          try {
            const tp = await getTeacherProfileByUserId(r.teacher_id);
            return { ...r, teacher: tp };
          } catch { return { ...r, teacher: null }; }
        })
      );
      setRequests(withTeachers);
    } catch { /* offline */ }
    setLoading(false);
  };

  // ── Realtime : statut des demandes mis à jour en temps réel ──────────────
  useEffect(() => {
    if (!user?.id) return;

    load();

    const channel = supabase
      .channel(`requests-student-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'accompaniment_requests',
          filter: `student_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as DbAccompanimentRequest;
          setRequests(prev =>
            prev.map(r =>
              r.id === updated.id ? { ...r, ...updated } : r
            )
          );
          // Notification selon le nouveau statut
          if (updated.status === 'accepted') {
            toast.success('🎉 Votre demande a été acceptée ! Votre espace de travail est prêt.', {
              duration: 6000,
              action: {
                label: 'Ouvrir',
                onClick: () => handleGoToCollab({ ...updated, teacher: undefined }),
              },
            });
          } else if (updated.status === 'refused') {
            toast.info('Votre demande n\'a pas été retenue par ce professeur.');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  const handleCancel = async (id: string) => {
    try {
      await cancelAccompanimentRequest(id);
      toast.success('Demande annulée.');
      setRequests(r => r.map(x => x.id === id ? { ...x, status: 'cancelled' as const } : x));
    } catch { toast.error('Impossible d\'annuler cette demande.'); }
  };

  // Navigation directe vers l'espace de collaboration correspondant
  const handleGoToCollab = async (req: RequestWithTeacher | DbAccompanimentRequest) => {
    try {
      const collab = await getCollaborationByRequestId(req.id);
      if (collab?.id) {
        navigate(`/espace-collaboration/${collab.id}`);
      } else {
        // Fallback : liste des collaborations
        navigate('/mes-collaborations');
      }
    } catch {
      navigate('/mes-collaborations');
    }
  };

  const pending  = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');
  const others   = requests.filter(r => r.status !== 'pending' && r.status !== 'accepted');

  return (
    <>
      <SEO title="Mes demandes — Apprenix" description="Suivez vos demandes d'accompagnement envoyées aux professeurs." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">Mes demandes</h1>
            <p className="text-muted-foreground mt-1 text-pretty text-sm">
              Suivez l'état de vos demandes d'accompagnement en temps réel.
            </p>
          </div>
          <Button onClick={() => navigate('/trouver-enseignant')} className="h-9 shrink-0">
            <Send className="w-4 h-4 mr-1.5" /> Nouvelle demande
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Aucune demande pour l'instant</p>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Parcourez l'annuaire des professeurs et envoyez votre première demande d'accompagnement.
            </p>
            <Button onClick={() => navigate('/trouver-enseignant')}>
              <Send className="w-4 h-4 mr-1.5" /> Trouver un professeur
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {accepted.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Acceptées ({accepted.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accepted.map(r => (
                    <RequestCard key={r.id} req={r} onCancel={handleCancel} onGoToCollab={handleGoToCollab} />
                  ))}
                </div>
              </section>
            )}
            {pending.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  En attente ({pending.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map(r => (
                    <RequestCard key={r.id} req={r} onCancel={handleCancel} onGoToCollab={handleGoToCollab} />
                  ))}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Historique
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.map(r => (
                    <RequestCard key={r.id} req={r} onCancel={handleCancel} onGoToCollab={handleGoToCollab} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}


