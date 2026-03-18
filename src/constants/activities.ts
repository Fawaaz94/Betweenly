export const ACTIVITY_ICON_OPTIONS = [
  { name: 'heart-outline', label: 'Heart' },
  { name: 'sparkles-outline', label: 'Sparkles' },
  { name: 'star-outline', label: 'Star' },
  { name: 'flame-outline', label: 'Flame' },
  { name: 'flash-outline', label: 'Flash' },
  { name: 'hand-left-outline', label: 'Hand Left' },
  { name: 'hand-right-outline', label: 'Hand Right' },
  { name: 'ellipse-outline', label: 'Circle' },
  { name: 'leaf-outline', label: 'Leaf' },
  { name: 'rose-outline', label: 'Rose' },
  { name: 'moon-outline', label: 'Moon' },
  { name: 'water-outline', label: 'Water' },
] as const;

export type ActivityIconName = (typeof ACTIVITY_ICON_OPTIONS)[number]['name'];

export const DEFAULT_ACTIVITY_TEMPLATES = [
  { name: 'Anal', icon: 'sparkles-outline', isDefault: false },
  { name: 'Hand Job', icon: 'hand-left-outline', isDefault: false },
  { name: 'Masturbation', icon: 'hand-right-outline', isDefault: false },
  { name: 'Oral', icon: 'rose-outline', isDefault: false },
  { name: 'Sex', icon: 'heart-outline', isDefault: true },
] as const;
