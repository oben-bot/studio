import { Target } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-primary/20 sticky top-0 bg-background/80 backdrop-blur-lg z-10">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Cazador de Oportunidades
        </h1>
      </div>
    </header>
  );
}
