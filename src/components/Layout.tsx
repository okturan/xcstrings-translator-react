import { ReactNode } from "react";
import { APIKeyInput } from "./APIKeyInput";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container-xl py-12 mx-auto w-full max-w-7xl px-4">
        <APIKeyInput />
        {children}
      </div>
    </div>
  );
}
