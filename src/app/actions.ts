'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp, getDocs, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { initializeFirebase } from '@/firebase/init';
import { autoCategorizeItem } from '@/ai/flows/auto-categorize-items';
import type { NewItem, Item, ItemCategory, SerializableItem } from '@/lib/types';
import { itemCategories } from '@/lib/types';

const { firestore: db } = initializeFirebase();

const itemSchema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(3, 'Location must be at least 3 characters.'),
  contact: z.string().min(5, 'Contact information must be at least 5 characters.'),
  type: z.enum(['Lost', 'Found']),
  photos: z.preprocess(
    (val) => (val ? (typeof val === 'string' ? JSON.parse(val) : val) : []),
    z.array(z.string()).optional()
  ),
});

export async function addItem(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = itemSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const newItemData: NewItem = validatedFields.data;

  try {
    // Auto-categorize item using AI
    const categorizationResult = await autoCategorizeItem({
      description: newItemData.description,
    });
    
    const category: ItemCategory = itemCategories.includes(categorizationResult.category)
      ? categorizationResult.category
      : 'Other';

    const preparedItem = {
      ...newItemData,
      category,
    };

    revalidatePath('/');
    return { success: true, data: preparedItem };
  } catch (e) {
    console.error('Error adding document: ', e);
    return {
      error: 'Something went wrong on the server. Please try again.',
    };
  }
}

export async function searchItems(query: string): Promise<SerializableItem[]> {
  if (!query) {
    return [];
  }

  try {
    const itemsSnapshot = await getDocs(collection(db, 'lost_found_items'));
    const itemsList: Item[] = [];
    itemsSnapshot.forEach((doc) => {
      itemsList.push({ id: doc.id, ...doc.data() } as Item);
    });
    
    const lowerCaseQuery = query.toLowerCase();

    // Perform a simple local search instead of AI-powered semantic search
    const filteredItems = itemsList.filter(item =>
        item.name.toLowerCase().includes(lowerCaseQuery) ||
        item.description.toLowerCase().includes(lowerCaseQuery) ||
        item.location.toLowerCase().includes(lowerCaseQuery) ||
        item.category.toLowerCase().includes(lowerCaseQuery)
    );

    // Manually serialize Timestamp objects
    const serializableItems: SerializableItem[] = filteredItems.map(item => {
        return {
            ...item,
            createdAt: (item.createdAt as Timestamp).toDate().toISOString(),
            resolvedAt: item.resolvedAt ? (item.resolvedAt as Timestamp).toDate().toISOString() : undefined,
        };
    });

    return serializableItems;

  } catch (e) {
    console.error('Error searching items: ', e);
    return [];
  }
}
