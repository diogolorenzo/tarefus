import React from 'react';
import {
  Briefcase,
  Building2,
  CalendarClock,
  Cloud,
  CreditCard,
  Download,
  History,
  LogIn,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Building2,
  CalendarClock,
  Cloud,
  CreditCard,
  Download,
  History,
  LogIn,
  ShieldCheck,
  UserCheck,
};

interface IconProps {
  name: string;
  className?: string;
}

/** Resolve o nome vindo de `src/content/home.ts` para o ícone Lucide correspondente. */
export const Icon: React.FC<IconProps> = ({ name, className }) => {
  const Component = ICONS[name] ?? Building2;
  return <Component className={className} aria-hidden="true" />;
};
