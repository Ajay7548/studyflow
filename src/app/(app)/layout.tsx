import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/**
 * Protected app layout with sidebar navigation and top header.
 * Sidebar is visible on desktop; mobile uses a sheet via the header.
 */
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-full min-h-screen">
    <div className="hidden md:flex">
      <Sidebar />
    </div>
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
    </div>
  </div>
);

export default AppLayout;
