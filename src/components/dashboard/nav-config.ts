import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  LayoutGrid,
  MessageSquare,
  PoundSterling,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react";
import type { Role } from "@/lib/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Not built yet — rendered inert with a "Soon" hint instead of a link. */
  disabled?: boolean;
}

export const TRAINER_NAV: NavItem[] = [
  { label: "Overview", href: "/trainer", icon: LayoutGrid },
  { label: "Enquiries", href: "/trainer/enquiries", icon: MessageSquare },
  { label: "Courses", href: "/trainer/courses", icon: BookOpen, disabled: true },
  { label: "Availability", href: "/trainer/availability", icon: Calendar, disabled: true },
  { label: "Reviews", href: "/trainer/reviews", icon: Star, disabled: true },
  { label: "Profile", href: "/trainer/profile", icon: User, disabled: true },
  { label: "Documents", href: "/trainer/documents", icon: FileText, disabled: true },
  { label: "Billing", href: "/trainer/billing", icon: CreditCard, disabled: true },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  { label: "Practitioners", href: "/admin/practitioners", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Billing", href: "/admin/billing", icon: PoundSterling },
  { label: "Config", href: "/admin/config", icon: Settings },
];

export function navForRole(role: Role): NavItem[] {
  return role === "admin" ? ADMIN_NAV : TRAINER_NAV;
}
