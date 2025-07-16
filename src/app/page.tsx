'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Upload, Settings, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { chatbotFlow, type ChatMessage } from '@/ai/flows/chatbotFlow';
import { useToast } from "@/hooks/use-toast";

// Configure the workerSrc to point to the local copy that next.config.ts will provide
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function Home() {
  const [knowledge, setKnowledge] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsResponding(true);

    try {
      if (!knowledge.trim() || !businessName.trim()) {
        toast({
          title: "Información Requerida",
          description: "Por favor, ingresa el nombre del negocio y la base de conocimiento.",
          variant: "destructive",
        });
        setMessages(prev => [...prev, { role: 'bot', content: 'Por favor, completa la información del negocio y la base de conocimiento para que pueda ayudarte.' }]);
        setIsResponding(false); // Detener la carga si falta información
        return;
      }
      
      const response = await chatbotFlow({
        history: [...messages, userMessage],
        knowledge,
        businessName,
      });

      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (error) {
      console.error('Error getting response from bot:', error);
       toast({
          title: "Error del Asistente",
          description: "No se pudo obtener una respuesta. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, tuve un problema al procesar tu solicitud.' }]);
    } finally {
      setIsResponding(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsTraining(true);
    let textContent = '';

    try {
      if (file.type === 'application/pdf') {
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
      setIsTraining(false);
       if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleTrain = () => {
     if (!knowledge.trim() || !businessName.trim()) {
        toast({
          title: "Información Requerida",
          description: "Por favor, ingresa el nombre del negocio y la base de conocimiento.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Asistente Listo",
        description: "La base de conocimiento está cargada. ¡Puedes empezar a chatear!",
      });

      setMessages([
        { role: 'bot', content: `¡Hola! Soy el asistente de ${businessName}. ¿Cómo puedo ayudarte?` }
      ]);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">BotForge</h1>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <Card>
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
                <Input
                  id="businessName"
                  placeholder="Ej: Ferretería 'El Martillo Feliz'"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="knowledge" className="font-medium">Base de Conocimiento</label>
                <Textarea
                  id="knowledge"
                  placeholder="Pega aquí la información de tu negocio: horarios, precios, FAQs, etc."
                  className="h-48"
                  value={knowledge}
                  onChange={(e) => setKnowledge(e.target.value)}
                />
              </div>
               <div className="flex gap-2">
                <Button className="w-full" onClick={handleTrain} disabled={isTraining}>
                  {isTraining ? <Loader2 className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
                  Entrenar Asistente
                </Button>
                <Button variant="outline" className="w-full" onClick={handleUploadClick} disabled={isTraining}>
                  {isTraining ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                  Subir Archivo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".txt,.md,.pdf,.docx"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col">
           <Card className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle>Vista Previa del Chatbot</CardTitle>
              <CardDescription>Así interactuarán tus clientes con el asistente.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div ref={chatContainerRef} className="flex-grow border rounded-lg p-4 space-y-4 overflow-y-auto h-96 bg-muted/20">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'bot' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                     {msg.role === 'user' && <User className="w-6 h-6 text-primary flex-shrink-0" />}
                  </div>
                ))}
                 {isResponding && (
                    <div className="flex items-end gap-2">
                      <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="rounded-lg px-4 py-2 max-w-sm bg-secondary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    </div>
                  )}
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isResponding && handleSendMessage()}
                  disabled={isResponding}
                />
                <Button onClick={handleSendMessage} disabled={isResponding}>
                  {isResponding ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
