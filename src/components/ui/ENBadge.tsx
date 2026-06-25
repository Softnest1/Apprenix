import { GraduationCap } from 'lucide-react';
import React from 'react';

/**
 * Badge compact "Conforme Éducation nationale"
 * À placer dans les en-têtes des pages outils et espace.
 */
const ENBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-chart-4/10 text-chart-4 border border-chart-4/25 shrink-0 ${className}`}
    title="Contenus alignés sur les programmes de l'Éducation nationale (Éduscol)"
    aria-label="Conforme aux programmes de l'Éducation nationale"
  >
    <GraduationCap className="w-2.5 h-2.5" aria-hidden="true" />
    Conforme EN
  </span>
);

export default ENBadge;
