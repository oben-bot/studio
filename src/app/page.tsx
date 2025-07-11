'use client';

import { Hexagon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Hexagon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">OBN Kodex LaserAI</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground p-4">
                <Hexagon className="mx-auto h-16 w-16" />
                <p className="mt-4">Listo para tu nueva idea.</p>
            </div>
        </div>
      </main>
    </div>
  );
}
