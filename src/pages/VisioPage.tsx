import {ArrowRight, BookOpen, Check, 
  Copy, ExternalLink, GraduationCap, Heart, Info,Mic, Monitor,RefreshCw,ShieldCheck, Users, 
  Video, 
  Wifi, X, 
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';

// ─── Types Jitsi External API ─────────────────────────────────────────────────
interface JitsiAPI {
  dispose: () => void;
  addListener: (event: string, listener: (...args: unknown[]) => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiAPI;
  }
}

// ─── Rôles disponibles ────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'etudiant',
    label: 'Étudiant',
    icon: BookOpen,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    desc: 'Rejoignez la salle de votre professeur ou d\'un camarade.',
  },
  {
    id: 'enseignant',
    label: 'Enseignant',
    icon: GraduationCap,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    border: 'border-chart-4/30',
    desc: 'Créez une salle et partagez le code à vos élèves.',
  },
  {
    id: 'parent',
    label: 'Parent / Tuteur',
    icon: Heart,
    color: 'text-chart-1',
    bg: 'bg-chart-1/10',
    border: 'border-chart-1/30',
    desc: 'Participez à la réunion de suivi avec l\'équipe pédagogique.',
  },
] as const;

type Role = typeof ROLES[number]['id'];

// ─── Génère un nom de salle sécurisé ─────────────────────────────────────────
const sanitizeRoom = (raw: string) =>
  raw.trim().replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-{2,}/g, '-').slice(0, 40);

const JITSI_DOMAIN = 'meet.jit.si';
const PREFIX = 'Apprenix-';

// ─── Config qualité haute — injectée via External API ────────────────────────
const JITSI_CONFIG = {
  // Qualité vidéo
  resolution: 720,
  constraints: {
    video: {
      height: { ideal: 720, max: 1080, min: 360 },
      frameRate: { max: 30 },
    },
  },
  // Performance réseau adaptative
  enableLayerSuspension: true,   // réduit la résolution si réseau faible
  channelLastN: 8,               // max 8 flux vidéo simultanés
  disableSimulcast: false,       // simulcast = plusieurs qualités en parallèle
  // P2P — bien meilleur à 2 participants (connexion directe)
  p2p: {
    enabled: true,
    stunServers: [
      { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' },
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
  // Audio
  enableNoisyMicDetection: true,
  enableNoAudioDetection: true,
  disableAudioLevels: false,
  // Démarrage
  startWithVideoMuted: false,
  startWithAudioMuted: false,
  // Sécurité
  prejoinPageEnabled: true,      // page de vérification cam/micro avant d'entrer
  // Divers
  disableDeepLinking: true,
  disableInviteFunctions: false,
};

const JITSI_INTERFACE_CONFIG = {
  SHOW_JITSI_WATERMARK: false,
  SHOW_WATERMARK_FOR_GUESTS: false,
  DEFAULT_REMOTE_DISPLAY_NAME: 'Participant Apprenix',
  TOOLBAR_BUTTONS: [
    'microphone', 'camera', 'desktop', 'fullscreen',
    'fodeviceselection', 'hangup', 'chat',
    'raisehand', 'videoquality', 'tileview',
    'mute-everyone', 'security', 'settings',
  ],
  MOBILE_APP_PROMO: false,
  HIDE_INVITE_MORE_HEADER: false,
};

// ─── Fonctionnalités de la salle ──────────────────────────────────────────────
const FEATURES = [
  { icon: Video,      label: 'Vidéo HD',          desc: 'Résolution 720p adaptative' },
  { icon: Mic,        label: 'Audio clair',        desc: 'Annulation de bruit auto' },
  { icon: Monitor,    label: 'Partage d\'écran',   desc: 'Présentation & documents' },
  { icon: Users,      label: 'Multi-participants', desc: 'Jusqu\'à 50 personnes' },
  { icon: ShieldCheck,label: 'Chiffré E2E',        desc: 'Connexion sécurisée' },
  { icon: Wifi,       label: 'Sans compte',        desc: '100 % gratuit, 0 pub' },
];

// ─── Composant Jitsi External API ────────────────────────────────────────────
interface JitsiRoomProps {
  room: string;
  displayName: string;
  onLeave: () => void;
}

const JitsiRoom: React.FC<JitsiRoomProps> = ({ room, displayName, onLeave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef       = useRef<JitsiAPI | null>(null);
  const mountedRef   = useRef(true);
  const [apiReady, setApiReady]   = useState(false);
  const [apiError, setApiError]   = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const jitsiRoom = `${PREFIX}${room}`;
  const jitsiUrl  = `https://${JITSI_DOMAIN}/${jitsiRoom}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(jitsiUrl).then(() => {
      setCopied(true);
      toast.success('Lien copié !', { description: 'Partagez-le à vos participants.' });
      setTimeout(() => { if (mountedRef.current) setCopied(false); }, 2000);
    });
  }, [jitsiUrl]);

  // Charge le script Jitsi External API puis monte la salle
  useEffect(() => {
    if (!containerRef.current) return;

    let scriptTag: HTMLScriptElement | null = null;

    const initApi = () => {
      if (!containerRef.current || !window.JitsiMeetExternalAPI) return;
      try {
        apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: jitsiRoom,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          configOverwrite: JITSI_CONFIG,
          interfaceConfigOverwrite: JITSI_INTERFACE_CONFIG,
          userInfo: { displayName: displayName || 'Apprenix' },
          lang: 'fr',
        });

        apiRef.current.addListener('readyToClose', () => {
          onLeave();
        });

        apiRef.current.addListener('videoConferenceLeft', () => {
          onLeave();
        });

        setApiReady(true);
      } catch {
        setApiError(true);
      }
    };

    // Script déjà chargé ?
    if (window.JitsiMeetExternalAPI) {
      initApi();
      return;
    }

    // Sinon, charger le script externe
    const script = document.createElement('script');
    scriptTag = script;
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = initApi;
    script.onerror = () => setApiError(true);
    document.head.appendChild(script);

    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
      // Nettoie le tag <script> pour éviter les doublons si le composant est remonté
      if (scriptTag && document.head.contains(scriptTag)) {
        document.head.removeChild(scriptTag);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jitsiRoom]);

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Impossible de charger la salle.{' '}
          <a href={jitsiUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
            Ouvrir dans un nouvel onglet →
          </a>
        </p>
        <Button variant="outline" size="sm" onClick={() => { setApiError(false); }}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Barre de contrôle */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div
            role="status"
            aria-label={apiReady ? 'Salle connectée' : 'Connexion en cours…'}
            className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${apiReady ? 'bg-success' : 'bg-warning'}`}
          />
          <span className="text-sm font-semibold text-foreground truncate">
            Salle : <code className="text-primary font-mono">{room}</code>
          </span>
          {!apiReady && (
            <span className="text-xs text-muted-foreground">Connexion…</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs hidden md:flex" onClick={copyLink}>
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié' : 'Copier le lien'}
          </Button>
          <a
            href={jitsiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-secondary/40 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Nouvel onglet</span>
          </a>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLeave}
          >
            <X className="w-3.5 h-3.5" />
            Quitter
          </Button>
        </div>
      </div>

      {/* Conteneur Jitsi External API */}
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-border shadow-lg bg-muted"
        style={{ height: 'calc(100dvh - 220px)', minHeight: 'max(calc(100vh - 220px), 420px)' }}
      />

      {/* Fallback mobile */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        Problème sur mobile ?{' '}
        <a href={jitsiUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Ouvrir dans un nouvel onglet
        </a>
      </p>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
const VisioPage: React.FC = () => {
  const [role, setRole]             = useState<Role>('etudiant');
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const [roomInput, setRoomInput]   = useState('');
  const [activeRoom, setActiveRoom] = useState('');
  const [inputError, setInputError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [userName, setUserName]     = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Récupère le prénom de l'utilisateur connecté pour l'afficher dans Jitsi
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Apprenix';
      setUserName(name as string);
    });
  }, []);

  // Génère un nom de salle aléatoire pour les enseignants
  const generateRoom = useCallback(() => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomInput(`Cours-${id}`);
    setInputError('');
  }, []);

  useEffect(() => {
    if (role === 'enseignant' && !roomInput) generateRoom();
  }, [role, roomInput, generateRoom]);

  // Rejoindre la salle
  const handleJoin = () => {
    const clean = sanitizeRoom(roomInput);
    if (clean.length < 3) {
      setInputError('Le nom de la salle doit faire au moins 3 caractères.');
      inputRef.current?.focus();
      return;
    }
    setInputError('');
    setActiveRoom(clean);
  };

  const handleLeave = () => {
    setActiveRoom('');
    toast.info('Vous avez quitté la salle.');
  };

  // Copier le lien de prévisualisation (avant d'entrer dans la salle)
  const copyPreviewLink = useCallback(() => {
    const url = `https://${JITSI_DOMAIN}/${PREFIX}${sanitizeRoom(roomInput)}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      toast.success('Lien copié !', { description: 'Partagez-le à vos participants.' });
      setTimeout(() => { if (mountedRef.current) setLinkCopied(false); }, 2000);
    });
  }, [roomInput]);

  return (
    <div className="max-w-5xl mx-auto py-4 min-w-0">
      <SEO
        title="Classe Virtuelle — Cours et Réunions en Visio | Apprenix"
        description="Rejoignez ou créez une salle de classe virtuelle sur Apprenix. Vidéo HD, partage d'écran, 100 % gratuit et sécurisé pour étudiants, enseignants et parents."
        canonical="/visio"
        noIndex={false}
        dateModified="2026-06-22"
      />

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      {!activeRoom && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl xl:text-3xl font-extrabold text-foreground text-balance">
                Classe Virtuelle
              </h1>
              <p className="text-sm text-muted-foreground">
                Cours à distance · Réunion parents-profs · Travail en groupe
              </p>
            </div>
            <Badge className="shrink-0 bg-success/10 text-success border-success/20 hidden md:flex">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Gratuit
            </Badge>
          </div>

          {/* Notice info */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-6">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground text-pretty">
              La salle utilise <strong className="text-foreground">Jitsi Meet</strong> — solution open-source chiffrée de bout en bout.
              Aucun compte requis. Le lien de la salle peut être partagé à n'importe qui.
              La caméra et le micro sont activés dans le navigateur.
            </p>
          </div>

          {/* ── Sélecteur de rôle ─────────────────────────────────────────── */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-foreground mb-3">Je suis…</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ROLES.map(({ id, label, icon: Icon, color, bg, border, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={[
                    'flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-[border-color,box-shadow]',
                    role === id
                      ? `${border} ${bg} shadow-sm`
                      : 'border-border hover:border-border/70 hover:bg-secondary/30',
                  ].join(' ')}
                >
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 text-pretty">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Formulaire salle ─────────────────────────────────────────── */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {role === 'enseignant' ? 'Créer ou rejoindre une salle' : 'Rejoindre une salle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="room-name" className="text-sm font-normal text-muted-foreground mb-1.5 block">
                  Nom de la salle
                  {role === 'etudiant' && (
                    <span className="ml-1 text-xs">(demandez-le à votre enseignant)</span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="room-name"
                    ref={inputRef}
                    value={roomInput}
                    onChange={e => { setRoomInput(e.target.value); setInputError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder={role === 'enseignant' ? 'Cours-Maths-3e' : 'Entrez le code de la salle…'}
                    className={`flex-1 ${inputError ? 'border-destructive' : ''}`}
                    maxLength={40}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {role === 'enseignant' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 shrink-0 text-xs"
                      onClick={generateRoom}
                    >
                      Générer
                    </Button>
                  )}
                </div>
                {inputError && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    {inputError}
                  </p>
                )}
                {roomInput && !inputError && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Salle : <code className="text-primary font-mono">{PREFIX}{sanitizeRoom(roomInput)}</code>
                  </p>
                )}
              </div>

              {/* Copier le lien — visible pour enseignants/parents */}
              {(role === 'enseignant' || role === 'parent') && roomInput && (
                <button
                  type="button"
                  onClick={copyPreviewLink}
                  className="flex items-center gap-2 w-full p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/70 transition-colors text-left"
                >
                  {linkCopied
                    ? <Check className="w-4 h-4 text-success shrink-0" />
                    : <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                  <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
                    {`https://${JITSI_DOMAIN}/${PREFIX}${sanitizeRoom(roomInput)}`}
                  </span>
                  <span className="text-xs font-medium text-primary shrink-0">
                    {linkCopied ? 'Copié !' : 'Copier le lien'}
                  </span>
                </button>
              )}

              <Button
                onClick={handleJoin}
                className="w-full h-11 gap-2"
                disabled={!roomInput.trim()}
              >
                <Video className="w-4 h-4" />
                {role === 'enseignant' ? 'Ouvrir la salle' : 'Rejoindre la salle'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* ── Fonctionnalités ───────────────────────────────────────────── */}
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground mb-3 text-balance">Ce qui est inclus</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Instructions par rôle ─────────────────────────────────────── */}
          <Card className="bg-secondary/30 border-border/60">
            <CardContent className="p-4">
              {role === 'etudiant' && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground mb-2">Mode Étudiant — comment ça marche ?</p>
                  {[
                    'Demandez le nom de la salle à votre enseignant ou camarade.',
                    'Entrez-le dans le champ ci-dessus et cliquez sur « Rejoindre ».',
                    'Autorisez la caméra et le micro dans votre navigateur.',
                    'Vous êtes connecté(e) — bon cours !',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground text-pretty">{step}</p>
                    </div>
                  ))}
                </div>
              )}
              {role === 'enseignant' && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground mb-2">Mode Enseignant — démarrer un cours</p>
                  {[
                    'Un nom de salle est généré automatiquement (vous pouvez le modifier).',
                    'Copiez le lien et partagez-le à vos élèves (email, ENT, message).',
                    'Cliquez sur « Ouvrir la salle » — vous êtes l\'hôte.',
                    'Les participants rejoignent en cliquant sur le lien partagé.',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-chart-4/15 text-chart-4 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground text-pretty">{step}</p>
                    </div>
                  ))}
                </div>
              )}
              {role === 'parent' && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground mb-2">Mode Parent / Tuteur</p>
                  {[
                    'Récupérez le lien de la réunion auprès de l\'établissement ou de l\'enseignant.',
                    'Ouvrez ce lien ou entrez le nom de la salle ci-dessus.',
                    'Autorisez la caméra et le micro puis rejoignez.',
                    'Aucun compte requis — la confidentialité est garantie.',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-chart-1/15 text-chart-1 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground text-pretty">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Salle active — Jitsi External API ────────────────────────────── */}
      {activeRoom && (
        <JitsiRoom room={activeRoom} displayName={userName} onLeave={handleLeave} />
      )}
    </div>
  );
};

export default VisioPage;
