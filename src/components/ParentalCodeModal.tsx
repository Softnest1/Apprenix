// Modale "Mode parental" — utilisée depuis la sidebar (toutes pages) ET EspaceEtudiantPage
// L'enfant génère un code à 6 chiffres (CSPRNG) à donner à ses parents.
// Les parents l'entrent sur /parents-espace pour consulter la progression.

import { Check, Copy, Eye, EyeOff, ExternalLink, RefreshCw, Shield, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// ─── Clé localStorage ─────────────────────────────────────────────────────────
const CODE_KEY = 'ep_parental_code';

// ─── Lecture du code sauvegardé ───────────────────────────────────────────────
export const readSavedParentalCode = (): string | null => {
  try {
    const raw = localStorage.getItem(CODE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { code: string }).code ?? null;
  } catch { return null; }
};

interface ParentalCodeModalProps {
  onClose: () => void;
}

const ParentalCodeModal: React.FC<ParentalCodeModalProps> = ({ onClose }) => {
  const [savedCode, setSavedCode] = useState<string | null>(readSavedParentalCode);
  const [showPin, setShowPin]     = useState(false);
  const [copied, setCopied]       = useState(false);

  // Génération cryptographiquement sûre (CSPRNG)
  const generateCode = useCallback(() => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = String(100000 + (array[0] % 900000));
    localStorage.setItem(CODE_KEY, JSON.stringify({ code }));
    setSavedCode(code);
    setShowPin(true);
  }, []);

  const copyCode = useCallback(() => {
    if (!savedCode) return;
    navigator.clipboard.writeText(savedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [savedCode]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configuration du code parental"
      className="fixed inset-0 z-[300] flex items-end md:items-center justify-center md:p-6 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[calc(100%-0px)] md:max-w-sm bg-background rounded-t-2xl md:rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(90dvh - env(safe-area-inset-top,0px))', paddingBottom: 'env(safe-area-inset-bottom,12px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle mobile */}
        <div className="flex justify-center pt-2.5 pb-0 md:hidden shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <p className="font-bold text-sm">Mode parental</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
            Génère un code à 6 chiffres à donner à tes parents. Ils pourront consulter ta progression depuis{' '}
            <strong className="text-foreground">Espace Parents</strong> sans jamais modifier tes données.
          </p>

          {savedCode ? (
            <div className="space-y-3">
              {/* Code */}
              <div className="rounded-xl border border-border bg-muted/50 p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Code parental actif</p>
                  <p className="font-mono text-2xl font-bold tracking-[0.3em] text-foreground select-all">
                    {showPin ? savedCode : '••••••'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPin(v => !v)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    aria-label={showPin ? 'Masquer le code' : 'Afficher le code'}
                  >
                    {showPin
                      ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                      : <Eye    className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    aria-label="Copier le code"
                  >
                    {copied
                      ? <Check className="w-4 h-4 text-success" />
                      : <Copy  className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* Lien espace parents */}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                <ExternalLink className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Tes parents entrent ce code sur la page{' '}
                  <Link
                    to="/parents-espace"
                    onClick={onClose}
                    className="text-primary font-semibold underline underline-offset-2"
                  >
                    Espace Parents
                  </Link>
                  .
                </p>
              </div>

              {/* Regénérer */}
              <Button variant="outline" size="sm" className="w-full h-10 gap-2 text-sm" onClick={generateCode}>
                <RefreshCw className="w-3.5 h-3.5" />
                Générer un nouveau code
              </Button>
            </div>
          ) : (
            /* Pas encore de code */
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-border p-4 flex flex-col items-center gap-2 text-center">
                <Shield className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Aucun code parental actif pour le moment.</p>
              </div>
              <Button className="w-full h-11 gap-2 text-sm" onClick={generateCode}>
                <Shield className="w-4 h-4" />
                Générer mon code parental
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentalCodeModal;
