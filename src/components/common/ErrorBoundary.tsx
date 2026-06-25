import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
  /** Fallback personnalisé optionnel */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

// ─── Composant UI de fallback ─────────────────────────────────────────────────

interface FallbackUIProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

const FallbackUI: React.FC<FallbackUIProps> = ({ error, errorInfo, onReset }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ backgroundColor: 'hsl(var(--background, 248 250 252))', color: 'hsl(var(--foreground, 15 23 42))' }}
    >
      <div className="w-full max-w-lg">

        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center mb-6">
          <Badge className="mb-3 bg-destructive/10 text-destructive border-destructive/20">
            Erreur inattendue
          </Badge>
          <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">
            Oups, quelque chose s'est mal passé
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            Une erreur s'est produite dans cette page. Vos données sont en sécurité.
            Essayez de rafraîchir la page ou revenez à l'accueil.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3 justify-center mb-6">
          <Button
            onClick={onReset}
            className="h-10 bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button
            onClick={goHome}
            variant="outline"
            className="h-10 gap-2"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Détails techniques (masqués par défaut) */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <button type="button"
                onClick={() => setShowDetails(v => !v)}
                className="w-full flex items-center justify-between text-xs font-medium text-destructive/80 hover:text-destructive transition-colors"
              >
                <span>Détails techniques</span>
                {showDetails
                  ? <ChevronUp className="w-3.5 h-3.5" />
                  : <ChevronDown className="w-3.5 h-3.5" />
                }
              </button>
              {showDetails && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-mono text-destructive break-all leading-relaxed">
                    {error.toString()}
                  </p>
                  {errorInfo?.componentStack && (
                    <pre className="text-xs font-mono text-muted-foreground overflow-x-auto max-h-32 scrollbar-thin">
                      {errorInfo.componentStack.slice(0, 600)}
                      {errorInfo.componentStack.length > 600 ? '…' : ''}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Aide */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Le problème persiste ?{' '}
          <a
            href="mailto:apprenix.contact@gmail.com"
            className="text-primary hover:underline"
          >
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
};

// ─── Rechargement cache-busting ──────────────────────────────────────────────
// Ajoute _cb= à l'URL pour forcer le navigateur à re-télécharger les assets
// et éviter la boucle infinie sur chunk stale (déploiement récent).
function forceCacheBustReload(): void {
  const base = window.location.pathname;
  window.location.replace(`${base}?_cb=${Date.now()}`);
}

// ─── Détection erreur chunk stale ────────────────────────────────────────────
function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false;
  const msg = error.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Unable to preload CSS') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk')
  );
}

// ─── ErrorBoundary (classe requise par React) ─────────────────────────────────

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary] Erreur capturée :', error, errorInfo);
    // Auto-reload cache-busting si chunk stale après déploiement
    // Ne s'applique PAS si un fallback explicite est fourni (ex: ChatBot silencieux)
    if (isChunkLoadError(error) && !('fallback' in this.props)) {
      const key = '__chunk_reload__';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        forceCacheBustReload();
      } else {
        sessionStorage.removeItem(key);
      }
    }
  }

  handleReset = () => {
    if (isChunkLoadError(this.state.error)) {
      sessionStorage.removeItem('__chunk_reload__');
      forceCacheBustReload();
      return;
    }
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  render() {
    if (this.state.hasError) {
      // fallback explicitement fourni (y compris null) → rendu silencieux
      if ('fallback' in this.props) return this.props.fallback ?? null;
      return (
        <FallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
