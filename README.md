# Firebase Studio - Campus Connect: Lost & Found

This is a Next.js starter project built in Firebase Studio. It's a "Lost & Found" application for a campus community, enhanced with AI features.

## Features

- **Report Lost & Found Items**: Users can submit a form to report items they have either lost or found.
- **Photo Uploads**: Users can upload photos of lost items or use their device's camera to capture photos of found items.
- **AI-Powered Auto-Categorization**: When a new item is submitted, a Genkit flow uses an AI model to automatically categorize the item (e.g., 'Mobile', 'Wallet', 'Keys').
- **AI-Powered Semantic Search**: A smart search bar allows users to find items based on descriptive queries, not just keywords. This is powered by another Genkit flow that understands the semantic meaning of the search query.
- **Real-time Updates**: The list of items updates in real-time using Firebase Firestore.
- **Modern UI**: Built with Next.js, React, and shadcn/ui for a clean and responsive user interface.

To get started, take a look at `src/app/page.tsx`.
