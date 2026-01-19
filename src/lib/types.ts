import type { Timestamp } from 'firebase/firestore';

export type ItemType = 'Lost' | 'Found';
export type ItemCategory = 'Mobile' | 'Wallet' | 'ID Card' | 'Keys' | 'Bag' | 'Other';

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  location: string;
  contact: string;
  category: ItemCategory;
  createdAt: Timestamp;
  photos?: string[];
}

export type ItemForAI = Omit<Item, 'createdAt' | 'category' | 'type' | 'contact' | 'photos'>;

export type NewItem = Omit<Item, 'id' | 'createdAt' | 'category'>;

export const itemCategories: ItemCategory[] = ['Mobile', 'Wallet', 'ID Card', 'Keys', 'Bag', 'Other'];
