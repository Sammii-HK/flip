import Link from "next/link";
import { Flag, FlaskConical, Settings, Zap } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Zap },
  { href: "/dashboard/flags", label: "Flags", icon: Flag },
  { href: "/dashboard/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r border-border bg-background flex flex-col p-4 gap-1">
        <Link href="/dashboard" className="text-lg font-bold text-accent mb-6 px-3">
          flip
        </Link>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-fg hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
