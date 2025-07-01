
'use client';

import { Button } from "@/components/ui/button";
import { Hexagon, Download } from 'lucide-react';
import type { UiMode } from '@/lib/definitions';

type MainHeaderProps = {
  handleDownload: () => void;
  resetWorkflow: () => void;
  svgResult: string | null;
  isProcessing: boolean;
  mode: UiMode;
};

export function MainHeader({ handleDownload, resetWorkflow, svgResult, isProcessing, mode }: MainHeaderProps) {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Hexagon className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">OBN Kodex LaserAI</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload} disabled={!svgResult || isProcessing}>
            <Download className="mr-2" />
            Exportar SVG
          </Button>
          {mode === 'chat' && <Button variant="outline" onClick={resetWorkflow}>Nuevo Diseño</Button>}
        </div>
      </div>
    </header>
  );
}
