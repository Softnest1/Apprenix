/**
 * ExportButton — Composant réutilisable d'export de contenu éducatif
 * Formats : PDF, DOCX (Word), TXT, Partage natif (Web Share API)
 * Compatible iOS, Android, Windows, macOS, tablette
 */

import {Copy,
  Download, FileText, FileType2, Loader2, Share2, 
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ExportSection {
  heading: string;
  body: string;
}

export interface ExportContent {
  title: string;
  subtitle?: string;
  sections: ExportSection[];
}

interface ExportButtonProps {
  /** Fonction qui retourne le contenu à exporter */
  getContent: () => ExportContent;
  /** Nom de base du fichier (sans extension) */
  fileName: string;
  /** Désactiver le bouton (ex: pas encore de contenu) */
  disabled?: boolean;
  /** Variante visuelle du bouton déclencheur */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Taille du bouton déclencheur */
  size?: 'sm' | 'default' | 'lg';
  /** Label personnalisé */
  label?: string;
  /** Classe CSS supplémentaire */
  className?: string;
}

// ─── Helpers d'export ────────────────────────────────────────────────────────

/** Formatte le contenu en texte brut */
function toPlainText(content: ExportContent): string {
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  let text = `${content.title}\n`;
  if (content.subtitle) text += `${content.subtitle}\n`;
  text += `Exporté le ${date} via Apprenix\n`;
  text += `${'═'.repeat(50)}\n\n`;

  for (const sec of content.sections) {
    text += `${sec.heading.toUpperCase()}\n`;
    text += `${'─'.repeat(sec.heading.length)}\n`;
    text += `${sec.body}\n\n`;
  }
  return text;
}

/** Génère et télécharge un PDF via jsPDF */
async function exportPdf(content: ExportContent, fileName: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW    = doc.internal.pageSize.getWidth();
  const pageH    = doc.internal.pageSize.getHeight();
  const marginX  = 18;
  const maxW     = pageW - marginX * 2;
  let y          = 20;

  const newPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkY = (needed: number) => { if (y + needed > pageH - 15) newPage(); };

  // En-tête
  doc.setFillColor(255, 107, 10);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Apprenix — Plateforme éducative gratuite', marginX, 9);
  const date = new Date().toLocaleDateString('fr-FR');
  doc.setFont('helvetica', 'normal');
  doc.text(date, pageW - marginX, 9, { align: 'right' });

  y = 24;

  // Titre principal
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(content.title, maxW) as string[];
  checkY(titleLines.length * 8 + 4);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 8 + 2;

  // Sous-titre
  if (content.subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(90, 90, 90);
    const subLines = doc.splitTextToSize(content.subtitle, maxW) as string[];
    checkY(subLines.length * 5 + 4);
    doc.text(subLines, marginX, y);
    y += subLines.length * 5 + 2;
  }

  // Ligne de séparation
  doc.setDrawColor(255, 107, 10);
  doc.setLineWidth(0.7);
  checkY(4);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  // Sections
  for (const sec of content.sections) {
    // Titre de section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 107, 10);
    const headLines = doc.splitTextToSize(sec.heading, maxW) as string[];
    checkY(headLines.length * 6 + 2);
    doc.text(headLines, marginX, y);
    y += headLines.length * 6 + 1;

    // Contenu
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const bodyLines = doc.splitTextToSize(sec.body, maxW) as string[];

    for (const line of bodyLines) {
      checkY(5);
      doc.text(line, marginX, y);
      y += 5;
    }
    y += 5;
  }

  // Pied de page sur toutes les pages
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
    doc.text('apprenix.fr — 100 % gratuit, sans publicité', marginX, pageH - 8);
  }

  doc.save(`${fileName}.pdf`);
}

// ─── Utilitaire téléchargement cross-platform ────────────────────────────────
// iOS Safari ne supporte PAS l'attribut `download` sur les liens blob.
// Solution : Web Share API avec fichier (iOS 15+) → sinon window.open (onglet).
const isIOS = typeof navigator !== 'undefined'
  && /iPad|iPhone|iPod/.test(navigator.userAgent)
  && !(window as unknown as { MSStream?: unknown }).MSStream;

async function downloadBlob(blob: Blob, fileName: string): Promise<void> {
  if (isIOS) {
    // iOS 15+ : partage natif avec le fichier (Enregistrer dans Fichiers, AirDrop, etc.)
    const file = new File([blob], fileName, { type: blob.type });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: fileName } as ShareData);
      return;
    }
    // Fallback iOS : ouvre dans un nouvel onglet → "Partager > Enregistrer dans Fichiers"
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 15_000);
    return;
  }
  // Navigateurs standards (Chrome, Firefox, Edge, Safari macOS)
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Génère et télécharge un fichier DOCX via la bibliothèque docx */
async function exportDocx(content: ExportContent, fileName: string): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  } = await import('docx');

  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const children: InstanceType<typeof Paragraph>[] = [];

  // Titre
  children.push(
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
    }),
  );

  // Sous-titre
  if (content.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: content.subtitle, italics: true, color: '555555', size: 22 })],
        spacing: { after: 120 },
      }),
    );
  }

  // Date d'export
  children.push(
    new Paragraph({
      children: [new TextRun({
        text: `Exporté le ${date} via Apprenix — apprenix.fr`,
        italics: true, color: '888888', size: 18,
      })],
      spacing: { after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'FF6B0A' } },
    }),
  );

  // Sections
  for (const sec of content.sections) {
    children.push(
      new Paragraph({
        text: sec.heading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
      }),
    );

    // Découpe le corps en paragraphes (séparés par \n)
    const lines = sec.body.split('\n');
    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line || ' ', size: 22 })],
          spacing: { after: line ? 80 : 40 },
        }),
      );
    }
  }

  const doc = new Document({
    creator: 'Apprenix',
    title: content.title,
    description: 'Document éducatif généré par Apprenix',
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  await downloadBlob(blob, `${fileName}.docx`);
}

/** Génère et télécharge un fichier TXT */
async function exportTxt(content: ExportContent, fileName: string): Promise<void> {
  const text = toPlainText(content);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  await downloadBlob(blob, `${fileName}.txt`);
}

/** Partage natif via Web Share API (mobile) ou copie presse-papiers (fallback) */
async function shareContent(content: ExportContent): Promise<void> {
  const text = toPlainText(content);

  if ('share' in navigator && (navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare?.({ title: content.title, text })) {
    await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ title: content.title, text, url: 'https://apprenix.fr' });
  } else {
    await navigator.clipboard.writeText(text);
    toast.success('Contenu copié dans le presse-papiers !');
  }
}

// ─── Composant ExportButton ──────────────────────────────────────────────────
const ExportButton: React.FC<ExportButtonProps> = ({
  getContent,
  fileName,
  disabled = false,
  variant  = 'outline',
  size     = 'sm',
  label    = 'Télécharger',
  className = '',
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (type: 'pdf' | 'docx' | 'txt' | 'share') => {
    if (disabled || loading) return;
    setLoading(type);
    const safeFileName = `${fileName}-${new Date().toISOString().split('T')[0]}`;

    try {
      const content = getContent();
      switch (type) {
        case 'pdf':
          await exportPdf(content, safeFileName);
          toast.success('PDF téléchargé avec succès !');
          break;
        case 'docx':
          await exportDocx(content, safeFileName);
          toast.success('Fichier Word téléchargé avec succès !');
          break;
        case 'txt':
          await exportTxt(content, safeFileName);
          toast.success('Fichier texte téléchargé avec succès !');
          break;
        case 'share':
          await shareContent(content);
          break;
      }
    } catch (err) {
      console.error('[ExportButton]', err);
      if (type !== 'share') toast.error('Échec de l\'export. Veuillez réessayer.');
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isLoading}
          aria-label="Télécharger ou partager ce contenu"
          className={`min-h-[48px] gap-1.5 ${className}`}
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Download className="h-4 w-4" />}
          <span>{isLoading ? 'En cours…' : label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Choisir le format
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handle('pdf')}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
          aria-label="Télécharger en PDF"
        >
          <FileText className="h-4 w-4 text-destructive shrink-0" />
          <span>PDF</span>
          <span className="ml-auto text-xs text-muted-foreground">Universel</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handle('docx')}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
          aria-label="Télécharger en Word (DOCX)"
        >
          <FileType2 className="h-4 w-4 text-primary shrink-0" />
          <span>Word (.docx)</span>
          <span className="ml-auto text-xs text-muted-foreground">PC / Mac</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handle('txt')}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
          aria-label="Télécharger en texte brut"
        >
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>Texte (.txt)</span>
          <span className="ml-auto text-xs text-muted-foreground">Léger</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handle('share')}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
          aria-label="Partager via l'application de votre choix"
        >
          {'share' in navigator
            ? <Share2 className="h-4 w-4 text-primary shrink-0" />
            : <Copy  className="h-4 w-4 text-primary shrink-0" />}
          <span>{'share' in navigator ? 'Partager' : 'Copier'}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {'share' in navigator ? 'WhatsApp, email…' : 'Presse-papiers'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
