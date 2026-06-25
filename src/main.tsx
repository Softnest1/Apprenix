import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'] as string | undefined,
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={
    <div className="flex flex-col items-center justify-center min-h-dvh p-8 text-center gap-4">
      <p className="text-lg font-semibold text-foreground">Une erreur inattendue s'est produite.</p>
      <p className="text-sm text-muted-foreground">Veuillez rafraîchir la page ou réessayer plus tard.</p>
      <button type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Rafraîchir la page
      </button>
    </div>
  }>
    <AppWrapper>
      <App />
    </AppWrapper>
  </Sentry.ErrorBoundary>
);
