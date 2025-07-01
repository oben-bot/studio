
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler } from "@/components/common/ruler";
import { LoaderCircle, Hexagon } from 'lucide-react';

type WorkspaceProps = {
  isProcessing: boolean;
  svgResult: string | null;
};

export function Workspace({ isProcessing, svgResult }: WorkspaceProps) {
  return (
    <div className="h-[calc(100vh-150px)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Lienzo de Trabajo</CardTitle>
          <CardDescription>Aquí verás el resultado de tu vectorización. Las medidas se muestran en la regla (px).</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <div className="grid grid-cols-[32px_1fr] grid-rows-[32px_1fr] w-full h-full">
            <div className="border-r border-b border-border"></div>
            <div className="relative border-b border-border">
              <Ruler orientation="horizontal" />
            </div>
            <div className="relative border-r border-border">
              <Ruler orientation="vertical" />
            </div>
            <div className="bg-muted relative overflow-auto">
              <div className="w-full h-full flex items-center justify-center p-4">
                {isProcessing && !svgResult && (
                  <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
                    <LoaderCircle className="w-16 h-16 animate-spin" />
                    <p className="mt-4">La IA está trabajando...</p>
                  </div>
                )}
                {svgResult && (
                  <div
                    className="w-full h-full p-8 bg-white"
                    dangerouslySetInnerHTML={{ __html: svgResult }}
                  />
                )}
                {!isProcessing && !svgResult && (
                  <div className="text-center text-muted-foreground p-4">
                    <Hexagon className="mx-auto h-16 w-16" />
                    <p className="mt-4">El resultado aparecerá aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
