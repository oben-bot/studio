'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hexagon, Download, Settings, Bot, Send, Mic, Image as ImageIcon, Ruler, Layers } from 'lucide-react';

export default function Home() {
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for vectorization settings
  const [detailLevel, setDetailLevel] = useState([50]);
  const [smoothness, setSmoothness] = useState([75]);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [singlePath, setSinglePath] = useState(true);

  const handleDownload = () => {
    if (!svgResult) return;
    const blob = new Blob([svgResult], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obn-kodex-vector.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-full">
          
          <aside className="space-y-6">
            <Card className="flex flex-col h-[calc(100vh-150px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> Asistente IA</CardTitle>
                <CardDescription>Describe lo que necesitas o sube una imagen.</CardDescription>
              </CardHeader>
              <ScrollArea className="flex-grow p-6 pt-0">
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <p><span className="font-semibold text-primary">LaserAI:</span> ¡Hola! ¿Qué te gustaría crear, vectorizar o buscar hoy?</p>
                    <p className="text-xs text-muted-foreground mt-2">Ej: "un logo de un león geométrico" o "vectoriza esta imagen para corte en madera de 3mm"</p>
                  </div>
                </CardContent>
              </ScrollArea>
              <CardFooter className="border-t p-4">
                <div className="relative w-full">
                  <Textarea
                    placeholder="Escribe tu comando aquí..."
                    className="pr-20"
                  />
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex gap-1">
                     <Button type="button" size="icon" variant="ghost">
                        <ImageIcon />
                        <span className="sr-only">Subir Imagen</span>
                      </Button>
                     <Button type="submit" size="icon">
                        <Send />
                        <span className="sr-only">Enviar</span>
                      </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings />Ajustes Generales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="detail" className="flex items-center gap-2"><Layers/> Nivel de Detalle</Label>
                  <Slider value={detailLevel} onValueChange={setDetailLevel} max={100} step={1} id="detail" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smoothness" className="flex items-center gap-2"><Ruler/> Suavizado de Curvas</Label>
                  <Slider value={smoothness} onValueChange={setSmoothness} max={100} step={1} id="smoothness" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="remove-bg">Eliminar Fondo</Label>
                  <Switch id="remove-bg" checked={removeBackground} onCheckedChange={setRemoveBackground} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="single-path">Trazado Único</Label>
                  <Switch id="single-path" checked={singlePath} onCheckedChange={setSinglePath} />
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="h-[calc(100vh-150px)]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Lienzo de Trabajo</CardTitle>
                <CardDescription>Aquí verás el resultado de tu vectorización.</CardDescription>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <div className="w-full h-[90%] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  {svgResult ? (
                    <div
                      className="w-full h-full p-4"
                      dangerouslySetInnerHTML={{ __html: svgResult }}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Hexagon className="mx-auto h-16 w-16" />
                      <p className="mt-4">El resultado aparecerá aquí</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
