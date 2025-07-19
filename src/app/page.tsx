'use client';

import { useState, useRef, useCallback } from 'react';
import { Bot, User, Send, Upload, Settings, BrainCircuit, Loader2, Wand2, Palette, Monitor, Download, RefreshCw, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { refineKnowledgeFlow } from '@/ai/flows/refineKnowledgeFlow';
import { imageToTextFlow } from '@/ai/flows/imageToTextFlow';
import { useToast } from "@/hooks/use-toast";
import { ChatbotInterface } from '@/components/ChatbotInterface';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type Mode = 'create' | 'customize' | 'test';

export default function Home() {
  const [knowledge, setKnowledge] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [mode, setMode] = useState<Mode>('create');
  const [activeTab, setActiveTab] = useState('create');
  const [primaryColor, setPrimaryColor] = useState('hsl(25 95% 53%)');
  const [feedbackKnowledge, setFeedbackKnowledge] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    let textContent = '';

    try {
      if (file.type.startsWith('image/')) {
        const dataUri = await fileToDataUri(file);
        const extractedText = await imageToTextFlow({ photoDataUri: dataUri });
        textContent = extractedText;
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        const numPages = pdf.numPages;
        let fullText = '';
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        }
        textContent = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        textContent = result.value;
      } else {
        textContent = await file.text();
      }
      setKnowledge(prev => prev ? `${prev}\n\n--- Contenido de ${file.name} ---\n${textContent}` : `--- Contenido de ${file.name} ---\n${textContent}`);
      toast({
        title: "Archivo Procesado",
        description: `El contenido de "${file.name}" ha sido añadido a la base de conocimiento.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
       toast({
          title: "Error al Subir Archivo",
          description: `No se pudo procesar el archivo "${file.name}".`,
          variant: "destructive",
        });
    } finally {
      setIsProcessingFile(false);
       if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRefineKnowledge = async () => {
    if (!refineInput.trim()) return;

    setIsRefining(true);
    try {
      const result = await refineKnowledgeFlow({ rawText: refineInput });
      setKnowledge(prev => prev ? `${prev}\n\n${result.refinedText}` : result.refinedText);
      setRefineInput('');
      toast({
        title: "Base de Conocimiento Refinada",
        description: "El texto ha sido mejorado y añadido a la base de conocimiento.",
      });
    } catch (error) {
      console.error('Error refining knowledge:', error);
      toast({
        title: "Error al Refinar",
        description: "No se pudo procesar el texto. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };
  
  const handleProceed = () => {
     if (!knowledge.trim() || !businessName.trim()) {
        toast({
          title: "Información Requerida",
          description: "Por favor, ingresa el nombre del negocio y la base de conocimiento antes de continuar.",
          variant: "destructive",
        });
        return;
      }
      if(activeTab === 'create') setActiveTab('customize');
      else if(activeTab === 'customize') setActiveTab('test');
  };
  
  const handleFeedbackRefresh = useCallback(() => {
    if (!feedbackKnowledge.trim()) {
      toast({ title: "Sin retroalimentación", description: "El cuadro de texto está vacío."});
      return;
    }
    const fullKnowledge = `--- INFORMACIÓN ADICIONAL PROPORCIONADA DURANTE LA PRUEBA ---\n${feedbackKnowledge}`;
    setKnowledge(prev => `${prev}\n\n${fullKnowledge}`);
    setFeedbackKnowledge('');
    toast({
      title: "Memoria Refrescada",
      description: "El chatbot ha incorporado tu retroalimentación.",
    });
  }, [feedbackKnowledge, toast]);

  const colorPalette = [
    { name: 'Naranja', value: 'hsl(25 95% 53%)' },
    { name: 'Azul', value: 'hsl(217 91% 60%)' },
    { name: 'Verde', value: 'hsl(142 71% 45%)' },
    { name: 'Rosa', value: 'hsl(340 82% 52%)' },
    { name: 'Morado', value: 'hsl(262 84% 58%)' },
  ];
  
  const fullKnowledgeBase = `
    ${knowledge}

    --- Información de Contacto Adicional ---
    Teléfono: ${contactPhone || 'No proporcionado'}
    WhatsApp: ${contactWhatsapp || 'No proporcionado'}
    Email de Contacto: ${contactEmail || 'No proporcionado'}
  `;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Creador de Asistentes de IA</h1>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>
       <main className="flex-grow container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create"><BrainCircuit className="mr-2"/>1. Entrenar</TabsTrigger>
                <TabsTrigger value="customize" disabled={!businessName || !knowledge}><Palette className="mr-2"/>2. Personalizar</TabsTrigger>
                <TabsTrigger value="test" disabled={!businessName || !knowledge}><Monitor className="mr-2"/>3. Probar</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-6">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                        <Card className="flex-grow">
                            <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="text-primary" />
                                Entrena a tu Asistente
                            </CardTitle>
                            <CardDescription>
                                Proporciona la información con la que tu chatbot atenderá a los clientes.
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="businessName" className="font-medium">Nombre del Negocio</label>
                                    <Input id="businessName" placeholder="Ej: Ferretería 'El Martillo Feliz'" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="knowledge" className="font-medium">Base de Conocimiento</label>
                                    <Textarea id="knowledge" placeholder="Pega aquí la información de tu negocio, sube un archivo o usa el asistente de la derecha para refinarla." className="h-48" value={knowledge} onChange={(e) => setKnowledge(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-medium">Información Adicional (Opcional)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Input placeholder="Teléfono de contacto" value={contactPhone} onChange={e => setContactPhone(e.target.value)}/>
                                        <Input placeholder="WhatsApp" value={contactWhatsapp} onChange={e => setContactWhatsapp(e.target.value)}/>
                                        <Input placeholder="Email de contacto" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}/>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="w-full" onClick={handleUploadClick} disabled={isProcessingFile}>
                                    {isProcessingFile ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                                    Subir Archivo/Imagen
                                    </Button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.pdf,.docx,image/png,image/jpeg,image/jpg"/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="flex flex-col">
                        <Card className="flex flex-col flex-grow">
                            <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="text-primary" />
                                Asistente de Creación
                            </CardTitle>
                            <CardDescription>Usa esta IA para refinar y estructurar la información para tu chatbot.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                            <div className="space-y-2 flex-grow flex flex-col">
                                <label htmlFor="refineInput" className="font-medium">Borrador de Información</label>
                                <Textarea id="refineInput" placeholder="Escribe tus ideas, FAQs o descripción de servicios aquí. Luego, presiona 'Refinar' para que la IA lo mejore y lo agregue a la Base de Conocimiento." className="flex-grow h-72" value={refineInput} onChange={(e) => setRefineInput(e.target.value)} />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button className="w-full" onClick={handleRefineKnowledge} disabled={isRefining}>
                                {isRefining ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                Refinar y Añadir
                                </Button>
                            </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="customize" className="mt-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personalización Visual</CardTitle>
                            <CardDescription>Ajusta la apariencia de tu chatbot para que coincida con tu marca.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="font-medium">Color Principal</label>
                                <div className="flex flex-wrap gap-2">
                                {colorPalette.map(color => (
                                    <button key={color.name} onClick={() => setPrimaryColor(color.value)} className={cn("h-10 w-10 rounded-full border-2 transition-transform transform hover:scale-110", primaryColor === color.value ? 'border-ring' : 'border-transparent')} style={{ backgroundColor: color.value }} aria-label={color.name} />
                                ))}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="font-medium">Logo del Negocio</label>
                                <Button variant="outline" disabled>
                                    <Upload className="mr-2"/> Subir Logo (Próximamente)
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                     <div className="flex flex-col items-center justify-center bg-muted/30 p-4 rounded-lg">
                        <CardTitle className="mb-4">Previsualización</CardTitle>
                        <div className="w-full max-w-sm" style={{ '--primary': primaryColor } as React.CSSProperties}>
                           <ChatbotInterface businessName={businessName} knowledgeBase={fullKnowledgeBase} isPreview={true} />
                        </div>
                     </div>
                </div>
            </TabsContent>
            <TabsContent value="test" className="mt-6">
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                             <CardHeader>
                                <CardTitle>Prueba tu Asistente</CardTitle>
                                <CardDescription>Conversa con tu IA para asegurarte de que responde como esperas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChatbotInterface businessName={businessName} knowledgeBase={fullKnowledgeBase} />
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquarePlus/>Retroalimentación en Vivo</CardTitle>
                                <CardDescription>Añade información a la base de conocimiento sin reiniciar la conversación.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Textarea 
                                    placeholder="Escribe aquí nueva información o correcciones..." 
                                    className="h-48"
                                    value={feedbackKnowledge}
                                    onChange={e => setFeedbackKnowledge(e.target.value)}
                                />
                                <Button className="w-full" onClick={handleFeedbackRefresh}>
                                    <RefreshCw className="mr-2"/>Refrescar Memoria
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="mt-8">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Download/>Exportar</CardTitle>
                                <CardDescription>Obtén tu chatbot para usarlo donde quieras.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                               <Button className="w-full" variant="outline" disabled>Obtener Link (Próximamente)</Button>
                               <Button className="w-full" variant="outline" disabled>Descargar Archivo (Próximamente)</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
            {activeTab !== 'test' && (
                <Button onClick={handleProceed} disabled={!businessName || !knowledge}>
                    {activeTab === 'create' ? 'Siguiente: Personalizar' : 'Siguiente: Probar'}
                </Button>
            )}
        </div>
      </main>
    </div>
  );
}
