import { Smartphone, Wallet, BadgeInfo, KeyRound, Briefcase, Box, IconProps } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';

const categoryIcons: Record<ItemCategory, React.ElementType<IconProps>> = {
  Mobile: Smartphone,
  Wallet: Wallet,
  'ID Card': BadgeInfo,
  Keys: KeyRound,
  Bag: Briefcase,
  Other: Box,
};

interface CategoryIconProps extends IconProps {
  category: ItemCategory;
}

export const CategoryIcon = ({ category, ...props }: CategoryIconProps) => {
  const IconComponent = categoryIcons[category] || Box;
  return <IconComponent {...props} />;
};
