'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hexagon, Download, Settings, Bot, Send, Image as ImageIcon, Ruler as RulerIcon, Layers, LoaderCircle } from 'lucide-react';
import { vectorizeImage } from '@/ai/flows/vectorize-image-flow';
import { runAgent } from '@/ai/flows/conversational-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const Ruler = ({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) => {
  const [size, setSize] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize(orientation === 'horizontal' ? width : height);
      }
    });

    const currentRef = ref.current;
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
      resizeObserver.disconnect();
    };
  }, [orientation]);

  const renderTicks = () => {
    const ticks = [];
    const interval = 50;
    if (size === 0) return null;

    const numTicks = Math.floor(size / interval);

    for (let i = 0; i <= numTicks; i++) {
      const position = i * interval;
      const isMajorTick = i % 2 === 0 && i > 0;
      
      ticks.push(
        <div
          key={i}
          className="absolute"
          style={orientation === 'horizontal' ? { left: `${position}px` } : { top: `${position}px` }}
        >
          <div
            className={cn(
              "bg-muted-foreground",
              orientation === 'horizontal' ? (isMajorTick ? 'h-3 w-px' : 'h-2 w-px') : (isMajorTick ? 'w-3 h-px' : 'w-2 h-px')
            )}
          />
          {isMajorTick && (
            <span
              className="absolute text-muted-foreground text-[10px] select-none"
              style={
                orientation === 'horizontal'
                  ? { transform: 'translateX(-50%)', top: '12px' }
                  : { transform: 'translateY(-50%)', left: '12px' }
              }
            >
              {position}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div ref={ref} className="relative w-full h-full">
      {renderTicks()}
    </div>
  );
};

export default function Home() {
  const { toast } = useToast();
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
      content: '¡Hola! Soy tu asistente OBN Kodex LaserAI. Pídeme un diseño (ej: "un logo de un león geométrico") o hazme una pregunta.'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isProcessing]);


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

        if (result.svgString) {
          setSvgResult(result.svgString);
          const assistantMessage: ChatMessage = { role: 'assistant', content: '¡Imagen vectorizada! Puedes ajustar los parámetros y volver a intentarlo, o exportarla.' };
          setChatMessages(prev => [...prev, assistantMessage]);
        } else {
           throw new Error('La IA no pudo generar un SVG.');
        }
      } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error al vectorizar la imagen. Por favor, intenta de nuevo.' };
        setChatMessages(prev => [...prev, errorMessage]);
        toast({
          variant: 'destructive',
          title: 'Error de Vectorización',
          description: 'No se pudo procesar la imagen. Verifica que el archivo sea válido.'
        });
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

  const handleChatSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const currentPrompt = chatInput;
    const userMessage: ChatMessage = { role: 'user', content: currentPrompt };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);
    setSvgResult(null);

    try {
      const result = await runAgent({
        prompt: currentPrompt,
        detailLevel: detailLevel[0],
        smoothness: smoothness[0],
        removeBackground,
        singlePath,
      });

      if (result.svgString) {
        setSvgResult(result.svgString);
        const assistantMessage: ChatMessage = { role: 'assistant', content: '¡Aquí tienes tu vector! Puedes ajustar los parámetros y volver a generarlo, o exportarlo.' };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else if (result.textResponse) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: result.textResponse };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("El agente no devolvió una respuesta válida.")
      }
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.' };
      setChatMessages(prev => [...prev, errorMessage]);
       toast({
          variant: 'destructive',
          title: 'Error de Generación',
          description: 'No se pudo procesar tu solicitud. Revisa la consola para más detalles.'
        });
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
          
          <aside className="space-y-6 flex flex-col">
            <Card className="flex flex-col flex-grow h-[calc(100vh-270px)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot /> Asistente IA</CardTitle>
                <CardDescription>Describe un diseño o haz una pregunta.</CardDescription>
              </CardHeader>
              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full" ref={chatContainerRef}>
                  <div className="space-y-4 p-6 pt-0">
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
              </div>
              <CardFooter className="border-t p-4">
                <form ref={formRef} onSubmit={handleChatSubmit} className="relative w-full flex items-center gap-2">
                  <Textarea
                    placeholder="Ej: Un logo de un león geométrico"
                    className="pr-20"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
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
                  <Label htmlFor="smoothness" className="flex items-center gap-2"><RulerIcon/> Suavizado de Curvas</Label>
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
                <CardDescription>Aquí verás el resultado de tu vectorización. Las medidas se muestran en la regla (px).</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-0 overflow-hidden">
                <div className="grid grid-cols-[32px_1fr] grid-rows-[32px_1fr] w-full h-full">
                  {/* Corner */}
                  <div className="border-r border-b border-border"></div>

                  {/* Horizontal Ruler */}
                  <div className="relative border-b border-border">
                     <Ruler orientation="horizontal" />
                  </div>

                  {/* Vertical Ruler */}
                  <div className="relative border-r border-border">
                     <Ruler orientation="vertical" />
                  </div>

                  {/* Canvas */}
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
        </div>
      </main>
    </div>
  );
}
