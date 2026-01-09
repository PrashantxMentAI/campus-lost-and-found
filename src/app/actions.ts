'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { autoCategorizeItem } from '@/ai/flows/auto-categorize-items';
import { semanticSearch } from '@/ai/flows/implement-semantic-search';
import type { NewItem, Item, ItemForAI } from '@/lib/types';
import { itemCategories } from '@/lib/types';

const itemSchema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(3, 'Location must be at least 3 characters.'),
  contact: z.string().min(5, 'Contact information must be at least 5 characters.'),
  type: z.enum(['Lost', 'Found']),
});

export async function addItem(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = itemSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const newItem: NewItem = validatedFields.data;

  try {
    // Auto-categorize item using AI
    const categorizationResult = await autoCategorizeItem({
      description: newItem.description,
    });
    
    const category = itemCategories.includes(categorizationResult.category)
      ? categorizationResult.category
      : 'Other';

    // Add item to Firestore
    await addDoc(collection(db, 'items'), {
      ...newItem,
      category,
      createdAt: serverTimestamp(),
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Error adding document: ', e);
    return {
      error: 'Something went wrong on the server. Please try again.',
    };
  }
}

export async function searchItems(query: string): Promise<Item[]> {
  if (!query) {
    return [];
  }

  try {
    const itemsSnapshot = await getDocs(collection(db, 'items'));
    const itemsList: Item[] = [];
    itemsSnapshot.forEach((doc) => {
      itemsList.push({ id: doc.id, ...doc.data() } as Item);
    });

    const itemsForAI: ItemForAI[] = itemsList.map((item) => ({
      id: item.id,
      itemName: item.name,
      description: item.description,
      location: item.location,
    }));

    const searchResults = await semanticSearch({
      query,
      items: itemsForAI,
    });

    const rankedItemIds = new Set(searchResults.map(item => item.id));

    // Filter and return original items based on search results
    const filteredItems = itemsList.filter(item => rankedItemIds.has(item.id));

    return filteredItems;

  } catch (e) {
    console.error('Error searching items: ', e);
    return [];
  }
}
