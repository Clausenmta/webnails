
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full min-w-0">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto min-w-0 max-w-full">
            <div className="container mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
