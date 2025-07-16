'use client';

import { useState, useRef } from 'react';
import { Bot, Info, Send, Upload, Settings, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OpportunityCard } from '@/components/OpportunityCard';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the workerSrc to point to the local copy that next.config.ts will provide
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function Home() {
  const [knowledge, setKnowledge] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { role: 'user', text: input }]);
    // Aquí iría la lógica de respuesta del bot
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: 'Actualmente estoy en desarrollo. Pronto podré responderte usando la información que me proporcionaste.' }]);
    }, 1000);
    setInput('');
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
        // Fallback for plain text files
        textContent = await file.text();
      }
      setKnowledge(prev => prev ? `${prev}\n\n--- Contenido de ${file.name} ---\n${textContent}` : `--- Contenido de ${file.name} ---\n${textContent}`);
    } catch (error) {
      console.error('Error processing file:', error);
      // You can add a toast notification here to inform the user
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Cazador de Oportunidades</h1>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 grid md:grid-cols-2 gap-8">
        {/* Columna de Configuración */}
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
                <Button className="w-full" disabled={isTraining}>
                  {isTraining ? <Loader2 className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
                  Entrenar Asistente
                </Button>
                <Button variant="outline" className="w-full" onClick={handleUploadClick} disabled={isTraining}>
                  <Upload className="mr-2" />
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
          <OpportunityCard />
        </div>

        {/* Columna de Chat */}
        <div className="flex flex-col">
           <Card className="flex flex-col flex-grow">
            <CardHeader>
              <CardTitle>Vista Previa del Chatbot</CardTitle>
              <CardDescription>Así interactuarán tus clientes con el asistente.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow border rounded-lg p-4 space-y-4 overflow-y-auto h-96 bg-muted/20">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'bot' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
