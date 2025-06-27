'use client';

import { useState, useRef, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hexagon, Download, Settings, Bot, Send, Image as ImageIcon, Ruler, Layers, LoaderCircle } from 'lucide-react';
import { vectorizeImage } from '@/ai/flows/vectorize-image-flow';
import { processUserPrompt } from '@/ai/flows/conversational-flow';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for vectorization settings
  const [detailLevel, setDetailLevel] = useState([50]);
  const [smoothness, setSmoothness] = useState([75]);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [singlePath, setSinglePath] = useState(true);

  // States for chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Describe lo que necesitas crear (ej. "un logo de un león geométrico") o sube una imagen para vectorizar.'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);


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
  
  const handleFileUpload = async (file: File) => {
    if (!file || isProcessing) return;

    setIsProcessing(true);
    setSvgResult(null);

    const userMessage: ChatMessage = { role: 'user', content: `Vectorizando la imagen: ${file.name}` };
    setChatMessages(prev => [...prev, userMessage]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageDataUri = reader.result as string;
        const result = await vectorizeImage({
          imageDataUri,
          detailLevel: detailLevel[0],
          smoothness: smoothness[0],
          removeBackground,
          singlePath,
        });

        setSvgResult(result.svgString);
        const assistantMessage: ChatMessage = { role: 'assistant', content: '¡Imagen vectorizada! Puedes ajustar los parámetros y volver a intentarlo, o exportarla.' };
        setChatMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error al vectorizar la imagen. Por favor, intenta de nuevo.' };
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsProcessing(false);
      }
    };
     reader.onerror = (error) => {
      console.error("Error reading file:", error);
      const errorMessage = { role: 'assistant', content: 'Ocurrió un error al leer el archivo.' };
      setChatMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    };
  };

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const currentPrompt = chatInput;
    const userMessage: ChatMessage = { role: 'user', content: currentPrompt };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);
    setSvgResult(null);

    try {
      const result = await processUserPrompt({
        prompt: currentPrompt,
        detailLevel: detailLevel[0],
        smoothness: smoothness[0],
        removeBackground,
        singlePath,
      });

      setSvgResult(result.svgString);
      const assistantMessage: ChatMessage = { role: 'assistant', content: '¡Aquí tienes tu vector! Puedes ajustar los parámetros y volver a generarlo, o exportarlo.' };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.' };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
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
              <ScrollArea className="flex-grow p-6 pt-0" ref={chatScrollAreaRef}>
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                     <div className="flex justify-start">
                        <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted flex items-center gap-2">
                          <LoaderCircle className="animate-spin w-4 h-4"/>
                           Procesando...
                        </div>
                     </div>
                  )}
                </div>
              </ScrollArea>
              <CardFooter className="border-t p-4">
                <form onSubmit={handleChatSubmit} className="relative w-full flex items-center gap-2">
                  <Textarea
                    placeholder="Ej: un águila con las alas abiertas"
                    className="pr-20"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                    <ImageIcon />
                    <span className="sr-only">Subir Imagen</span>
                  </Button>
                  <Button type="submit" size="icon" disabled={isProcessing || !chatInput.trim()}>
                    <Send />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings />Ajustes de Vectorización</CardTitle>
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
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Lienzo de Trabajo</CardTitle>
                <CardDescription>Aquí verás el resultado de tu vectorización.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-6">
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  {isProcessing && !svgResult && (
                    <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
                      <LoaderCircle className="w-16 h-16 animate-spin" />
                      <p className="mt-4">La IA está trabajando...</p>
                    </div>
                  )}
                  {!isProcessing && svgResult && (
                    <div
                      className="w-full h-full p-4"
                      dangerouslySetInnerHTML={{ __html: svgResult }}
                    />
                  )}
                  {!isProcessing && !svgResult && (
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
