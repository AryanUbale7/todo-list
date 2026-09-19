import React from 'react';
import {
  Briefcase,
  User,
  ShoppingCart,
  Heart,
  FolderKanban,
  Tag,
  Star,
  Book,
  Code,
  Bell,
  Coffee,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const iconMap = {
  briefcase: Briefcase,
  user: User,
  'shopping-cart': ShoppingCart,
  shopping: ShoppingCart,
  heart: Heart,
  'folder-kanban': FolderKanban,
  folder: FolderKanban,
  tag: Tag,
  star: Star,
  book: Book,
  code: Code,
  bell: Bell,
  coffee: Coffee,
  layers: Layers,
  sparkles: Sparkles
};

export function renderCategoryIcon(iconName, className = "w-4 h-4") {
  const IconComponent = iconMap[iconName] || Tag;
  return <IconComponent className={className} />;
}
