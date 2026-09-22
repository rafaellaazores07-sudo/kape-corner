import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {!isAdminArea && <Header />}
      <main
        id="main-content"
        data-ocid="main_content"
        className="flex-1 bg-background"
      >
        {children}
      </main>
      {!isAdminArea && <Footer />}
    </div>
  );
}
