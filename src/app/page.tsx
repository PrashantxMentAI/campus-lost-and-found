import ItemForm from '@/components/item-form';
import ItemList from '@/components/item-list';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="bg-secondary py-6 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            Campus Connect: Lost & Found
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Your friendly campus board to reunite lost items with their owners.
            Submit a lost or found item below.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section id="submission" className="mb-12">
            <ItemForm />
          </section>
          <section id="items-board">
            <ItemList />
          </section>
        </div>
      </main>

      <footer className="py-6 mt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          A smart campus solution that bridges the gap between lost items and their owners.
        </p>
      </footer>
    </div>
  );
}
