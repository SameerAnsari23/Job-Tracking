import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Gauge,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Radar,
  RotateCw,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  Sun,
  Trash2,
  User,
  WifiOff,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * The approved icon registry (Phase 16.2: Lucide only, one icon per concept
 * product-wide). Adding an icon means adding it HERE — ad-hoc lucide imports
 * elsewhere are a review rejection.
 */
const ICONS = {
  alert: AlertCircle,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  bell: Bell,
  bookmark: Bookmark,
  briefcase: Briefcase,
  building: Building2,
  calendar: Calendar,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  clock: Clock,
  compass: Compass,
  copy: Copy,
  externalLink: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  file: FileText,
  filter: Filter,
  gauge: Gauge,
  info: Info,
  dashboard: LayoutDashboard,
  logOut: LogOut,
  mail: Mail,
  mapPin: MapPin,
  menu: Menu,
  moon: Moon,
  more: MoreHorizontal,
  pause: Pause,
  edit: Pencil,
  play: Play,
  plus: Plus,
  radar: Radar,
  refresh: RotateCw,
  search: Search,
  settings: Settings,
  sliders: SlidersHorizontal,
  star: Star,
  sun: Sun,
  trash: Trash2,
  user: User,
  offline: WifiOff,
  close: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export type IconSize = 14 | 16 | 18 | 20 | 24;

export interface IconProps {
  name: IconName;
  /** Phase 16.2 sizes: 14 inline-sm · 16 inline/buttons · 18 nav/icon-only · 20 feature · 24 display. */
  size?: IconSize;
  /**
   * Decorative by default (aria-hidden). Pass a label ONLY when the icon is
   * the sole carrier of meaning — it becomes role="img" with that name.
   */
  label?: string;
}

/**
 * Icon color always inherits from the surrounding text color (Phase 16.2
 * rule: never hardcode icon color independently of text).
 */
export function Icon({ name, size = 16, label }: IconProps) {
  const LucideComponent = ICONS[name];
  return (
    <LucideComponent
      size={size}
      strokeWidth={1.5}
      color="currentColor"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    />
  );
}
