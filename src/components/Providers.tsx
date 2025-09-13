"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ToastProvider";
import { ErrorBoundary } from "./ErrorBoundary";
import TopNav from "./TopNav";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ErrorBoundary>
          <TopNav />
          <div id="main-content" style={{ paddingTop: 56 }}>
            {children}
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </SessionProvider>
  );
}