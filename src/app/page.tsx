import { Header } from '@/components/header';
import { OpportunityHunter } from '@/components/opportunity-hunter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <OpportunityHunter />
      </main>
      <footer className="py-4">
        <p className="text-center text-sm text-muted-foreground">
          Creado con IA por Cazador de Oportunidades
        </p>
      </footer>
    </div>
  );
}
