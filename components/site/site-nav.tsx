"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SiteNav({
  isLoggedIn,
  isStaff,
}: {
  isLoggedIn: boolean;
  isStaff: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/cours", label: "Catalogue" },
    ...(isLoggedIn ? [{ href: "/apprendre", label: "Mes cours" }] : []),
    ...(isStaff ? [{ href: "/admin", label: "Studio" }] : []),
  ];

  const renderLinks = (onNavigate?: () => void) =>
    links.map((l) => (
      <Link
        key={l.href}
        href={l.href}
        onClick={onNavigate}
        className={cn(
          "rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
          pathname.startsWith(l.href) && "font-medium text-foreground",
          l.label === "Studio" && "text-primary hover:text-primary/80",
        )}
      >
        {l.label}
      </Link>
    ));

  return (
    <>
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {renderLinks()}
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="right" className="w-64">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <nav className="mt-8 flex flex-col gap-2 text-sm">
            {renderLinks(() => setOpen(false))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
