"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Shield, BookOpen, Layers, LogOut, FileText } from "lucide-react";
import { useStore } from "../store/useStore";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chart", href: "/chart", icon: LineChart },
  { name: "Strategies", href: "/strategy", icon: Layers },
  { name: "Orders", href: "/orders", icon: BookOpen },
  { name: "Risk Config", href: "/risk", icon: Shield },
  { name: "Audit Logs", href: "/logs", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white border-r border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight text-blue-500">Kotak Neo Trader</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-800 p-4 space-y-4">
        <div className="px-3">
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest border border-gray-700 rounded py-2 px-2">
                Simulated / Mock Trading App.<br/>User assumes all financial risk.
            </p>
        </div>
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-gray-800 hover:text-red-300"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );
}
