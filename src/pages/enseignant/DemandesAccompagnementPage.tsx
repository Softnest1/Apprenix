import {
  CheckCircle, Clock, GraduationCap, Loader2, MessageSquare, X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import { acceptRequest, getRequestsForTeacher, refuseRequest } from '@/lib/api';
import { supabase } from '@/db/supabase';
import type { DbAccompanimentRequest } from '@/db/supabase';

type ReqWithStudent = DbAccompanimentRequest & { studentName?: string; studentEmoji?: string };

function RequestCard({
  req, onAccept, onRefuse,
}: {
  req: ReqWithStudent;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
}) {
  const [loadingAccept, setLoadingAccept] = useState(false);
  const navigate = useNavigate();
  const [loadingRefuse, setLoadingRefuse] = useState(false);

  const handleAccept = async () => {
    setLoadingAccept(true);
    await onAccept(req.id);
    setLoadingAccept(false);
  };
  const handleRefuse = async () => {
    setLoadingRefuse(true);
    await onRefuse(req.id);
    setLoadingRefuse(false);
  };

  const date = new Date(req.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Header étudiant */}
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0 border border-border">
            <AvatarFallback className="bg-secondary text-xl">
              {req.studentEmoji || '👨‍🎓'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {req.studentName || 'Étudiant'}
            </p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          {req.status === 'pending' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/15 text-warning-foreground border border-warning/30 rounded-full text-xs font-medium shrink-0">
              <Clock className="w-3 h-3" /> En attente
            </span>
          )}
          {req.status === 'accepted' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-success/15 text-success border border-success/30 rounded-full text-xs font-medium shrink-0">
              <CheckCircle className="w-3 h-3" /> Acceptée
            </span>
          )}
          {req.status === 'refused' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-full text-xs font-medium shrink-0">
              <X className="w-3 h-3" /> Refusée
            </span>
          )}
        </div>

        {/* Matière */}
        <div>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{req.subject}</span>
        </div>

        {/* Message */}
        {req.message && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-foreground/80 text-pretty leading-relaxed">"{req.message}"</p>
          </div>
        )}

        {/* Actions */}
        {req.status === 'pending' && (
          <div className="flex gap-2 mt-auto pt-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 h-9 text-destructive border-destructive/30 hover:bg-destructive/10" disabled={loadingRefuse}>
                  {loadingRefuse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5 mr-1.5" />}
                  Refuser
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle>Refuser cette demande ?</AlertDialogTitle>
                </AlertDialogHeader>
                <p className="text-sm text-muted-foreground">L'étudiant sera notifié que sa demande n'a pas été retenue.</p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRefuse}>
                    Refuser
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" className="flex-1 h-9 bg-success/90 hover:bg-success text-white" onClick={handleAccept} disabled={loadingAccept}>
              {loadingAccept ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
              Accepter
            </Button>
          </div>
        )}
        {req.status === 'accepted' && (
          <Button size="sm" type="button" variant="outline" className="mt-auto h-9" onClick={() => navigate(`/espace-enseignant/collaborations`)}>
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Espace de travail disponible
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function DemandesAccompagnementPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReqWithStudent[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const reqs = await getRequestsForTeacher(user.id);
      // Charger les noms des étudiants
      const withStudents = await Promise.all(
        reqs.map(async r => {
          try {
            const { data } = await supabase.from('profiles').select('name, avatar_url').eq('id', r.student_id).maybeSingle();
            return { ...r, studentName: data?.name ?? 'Étudiant', studentEmoji: data?.avatar_url ?? '👨‍🎓' };
          } catch { return { ...r, studentName: 'Étudiant', studentEmoji: '👨‍🎓' }; }
        })
      );
      setRequests(withStudents);
    } catch { /* offline */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleAccept = async (id: string) => {
    try {
      const collabId = await acceptRequest(id);
      toast.success('Demande acceptée ! L\'espace de travail est prêt.');
      setRequests(r => r.map(x => x.id === id ? { ...x, status: 'accepted' as const } : x));
      if (collabId) navigate(`/espace-collaboration/${collabId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors de l\'acceptation.');
    }
  };

  const handleRefuse = async (id: string) => {
    try {
      await refuseRequest(id);
      toast.success('Demande refusée. L\'étudiant a été notifié.');
      setRequests(r => r.map(x => x.id === id ? { ...x, status: 'refused' as const } : x));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur.');
    }
  };

  const pending  = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');
  const others   = requests.filter(r => r.status !== 'pending' && r.status !== 'accepted');

  return (
    <>
      <SEO title="Demandes d'accompagnement — Espace Enseignant" description="Gérez les demandes d'accompagnement de vos élèves." />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Demandes d'accompagnement</h1>
          <p className="text-muted-foreground mt-1 text-sm text-pretty">
            Acceptez ou refusez les demandes de suivi personnalisé des étudiants.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">Aucune demande reçue</p>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Les demandes d'accompagnement des étudiants apparaîtront ici. Assurez-vous que votre profil est visible dans l'annuaire.
            </p>
            <Button variant="outline" onClick={() => navigate('/espace-enseignant/profil')}>
              Configurer mon profil
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  En attente
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-warning text-warning-foreground text-xs font-bold">
                    {pending.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map(r => <RequestCard key={r.id} req={r} onAccept={handleAccept} onRefuse={handleRefuse} />)}
                </div>
              </section>
            )}
            {accepted.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Acceptées ({accepted.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accepted.map(r => <RequestCard key={r.id} req={r} onAccept={handleAccept} onRefuse={handleRefuse} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Historique</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.map(r => <RequestCard key={r.id} req={r} onAccept={handleAccept} onRefuse={handleRefuse} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
