import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <AppSidebar />
        {/* Main content area — offset by collapsed sidebar width (w-14 = 3.5rem) */}
        <main className="ml-14 relative min-h-screen">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
