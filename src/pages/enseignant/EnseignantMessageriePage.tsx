import {
  MessageSquare, Send, User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message { id: string; from: 'teacher' | 'student'; text: string; date: string; }
interface Conversation { id: string; studentName: string; messages: Message[]; }

function useMessaging(): [Conversation[], (convId: string, text: string) => void] {
  const KEY = 'ep_teacher_messaging';
  const [convs, setConvs] = useState<Conversation[]>(() => {
    try {
      const r = localStorage.getItem(KEY);
      if (r) return JSON.parse(r) as Conversation[];
    } catch { /**/ }
    // Données démo initiales
    return [
      {
        id: '1', studentName: 'Élève (démo)',
        messages: [
          { id: '1a', from: 'student', text: 'Bonjour ! Pourriez-vous m\'expliquer la règle des signes en algèbre ?', date: new Date().toISOString() },
        ],
      },
    ];
  });

  const save = (updated: Conversation[]) => {
    setConvs(updated);
    try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /**/ }
  };

  const sendMessage = (convId: string, text: string) => {
    save(convs.map(c => c.id === convId ? {
      ...c,
      messages: [...c.messages, { id: crypto.randomUUID(), from: 'teacher', text, date: new Date().toISOString() }],
    } : c));
  };

  return [convs, sendMessage];
}

export default function EnseignantMessageriePage() {
  const [convs, sendMessage] = useMessaging();
  const [selected, setSelected]   = useState<string | null>(convs[0]?.id ?? null);
  const [draft, setDraft]         = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conv = convs.find(c => c.id === selected);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv?.messages.length]);

  const send = () => {
    if (!draft.trim() || !selected) return;
    sendMessage(selected, draft.trim());
    setDraft('');
  };

  return (
    <>
      <SEO title="Messagerie — Espace Enseignant" description="Échangez avec vos élèves." />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Messagerie élèves</h1>
          <p className="text-sm text-muted-foreground">{convs.length} conversation(s)</p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
          <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">💬 Comment utiliser la messagerie ?</p>
            <p className="text-sm text-muted-foreground mt-0.5 text-pretty">
              Sélectionnez une conversation à gauche pour lire les messages d'un élève. Tapez votre réponse en bas et appuyez sur <strong>Entrée</strong> ou cliquez l'icône envoi. Les élèves voient vos réponses dans leur espace.
            </p>
          </div>
        </div>

        {convs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucune conversation</p>
            <p className="text-sm mt-1">Les échanges avec vos élèves apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[70vh] min-h-0">
            {/* Liste conversations */}
            <div className="flex flex-col gap-1 overflow-y-auto">
              {convs.map(c => (
                <button key={c.id} type="button"
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
                    selected === c.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
                  )}
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {c.studentName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.messages.at(-1)?.text ?? 'Aucun message'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Zone conversation */}
            {conv ? (
              <Card className="flex flex-col h-full min-h-0">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {conv.studentName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm text-foreground">{conv.studentName}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {conv.messages.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                      <div className={cn(
                        'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm text-pretty',
                        m.from === 'teacher'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      )}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Saisie */}
                <div className="flex gap-2 p-3 border-t border-border shrink-0">
                  <Input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Votre message…"
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={send} disabled={!draft.trim()} className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground rounded-xl border border-dashed border-border">
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
