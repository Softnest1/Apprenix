import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import ApprenixLogo from "@/components/ui/ApprenixLogo";

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page introuvable — Erreur 404 | Apprenix"
        description="Page introuvable. Retournez à l'accueil Apprenix pour trouver vos outils d'aide aux devoirs, flashcards et révisions gratuits."
        noIndex={true}
      />
      <div className="relative flex flex-col items-center justify-center min-h-dvh p-6 overflow-hidden bg-background">
        <div className="mx-auto w-full max-w-sm text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <ApprenixLogo size={56} />
          </div>

          {/* Illustration */}
          <img src="/images/error/404.svg"      alt="" aria-hidden="true" width={192} height={192} className="mx-auto w-48 dark:hidden" />
          <img src="/images/error/404-dark.svg" alt="" aria-hidden="true" width={192} height={192} className="mx-auto w-48 hidden dark:block" />

          {/* Texte */}
          <h1 className="mt-6 mb-3 font-bold text-foreground text-2xl md:text-3xl xl:text-4xl text-balance">
            Page introuvable
          </h1>
          <p className="mb-8 text-sm text-muted-foreground text-pretty">
            Cette page a peut-être été supprimée ou n'existe pas. Vérifie l'adresse URL et réessaie.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm hover:bg-secondary transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
          © Apprenix {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
}
