import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  LayoutGrid,
  MessageSquare,
  Settings,
  Star,
  User,
  UserCog,
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
  { label: "Courses", href: "/trainer/courses", icon: BookOpen },
  { label: "Availability", href: "/trainer/availability", icon: Calendar },
  { label: "Reviews", href: "/trainer/reviews", icon: Star },
  { label: "Profile", href: "/trainer/profile", icon: User },
  { label: "Documents", href: "/trainer/documents", icon: FileText },
  { label: "Billing", href: "/trainer/billing", icon: CreditCard },
  { label: "Settings", href: "/trainer/settings", icon: Settings },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  { label: "Practitioners", href: "/admin/practitioners", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Config", href: "/admin/config", icon: Settings },
  { label: "Settings", href: "/admin/settings", icon: UserCog },
];

export const STUDENT_NAV: NavItem[] = [
  { label: "Overview", href: "/student", icon: LayoutGrid },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Saved", href: "/student/saved", icon: Heart },
  { label: "Reviews", href: "/student/reviews", icon: Star },
  { label: "Profile", href: "/student/profile", icon: User },
  { label: "Settings", href: "/student/settings", icon: Settings },
];

export function navForRole(role: Role): NavItem[] {
  if (role === "admin") return ADMIN_NAV;
  if (role === "student") return STUDENT_NAV;
  return TRAINER_NAV;
}
