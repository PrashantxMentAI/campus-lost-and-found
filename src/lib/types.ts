import type { Timestamp } from 'firebase/firestore';

export type ItemType = 'Lost' | 'Found';
export type ItemCategory = 'Mobile' | 'Wallet' | 'ID Card' | 'Keys' | 'Bag' | 'Other';
export type ItemStatus = 'Open' | 'Resolved';

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
  name: string;
  description: string;
  location: string;
  contact: string;
  category: ItemCategory;
  createdAt: Timestamp;
  photos?: string[];
  status: ItemStatus;
  resolvedAt?: Timestamp;
  claimerContact?: string;
}

export type SerializableItem = Omit<Item, 'createdAt' | 'resolvedAt'> & {
    createdAt: string;
    resolvedAt?: string;
};

export interface ItemQuery {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

export type ItemForAI = Omit<Item, 'createdAt' | 'category' | 'type' | 'contact' | 'photos' | 'userId' | 'status' | 'resolvedAt' | 'claimerContact'>;

export type NewItem = Omit<Item, 'id' | 'createdAt' | 'category' | 'userId' | 'status' | 'resolvedAt' | 'claimerContact'>;

export const itemCategories: ItemCategory[] = ['Mobile', 'Wallet', 'ID Card', 'Keys', 'Bag', 'Other'];
