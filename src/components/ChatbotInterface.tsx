
'use client';
import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { aiChatbot } from '@/ai/flows/chatbotFlow';
import type { ChatMessage } from '@/ai/flows/schemas';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface ChatbotInterfaceProps {
  businessName: string;
  knowledgeBase: string;
  isPreview?: boolean;
  logoUrl?: string | null;
}

export function ChatbotInterface({ businessName, knowledgeBase, isPreview = false, logoUrl }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const userId = 'test-user'; 

  // Use a stable knowledge base for the duration of a session unless it changes
  const stableKnowledgeBase = useRef(knowledgeBase);
  useEffect(() => {
    stableKnowledgeBase.current = knowledgeBase;
  }, [knowledgeBase]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isPreview) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(-10);

      const result = await aiChatbot({
        userId,
        businessName,
        knowledge: stableKnowledgeBase.current,
        currentMessageText: input,
        chatHistory,
      });

      const assistantMessage: ChatMessage = { role: 'assistant', text: result.response };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error calling AI chatbot:', error);
      toast({
        title: "Error de Comunicación",
        description: "No se pudo obtener una respuesta del asistente. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      // Do not remove user message on error, so they can retry
      // setMessages(prev => prev.slice(0, -1)); 
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set initial welcome message for previews
  useEffect(() => {
    if (isPreview) {
      setMessages([
        { role: 'assistant', text: `¡Hola! Soy el asistente virtual de ${businessName || 'tu negocio'}. ¿En qué puedo ayudarte hoy?` },
      ]);
    }
  }, [isPreview, businessName]);

  // Set initial welcome message for test chat
   useEffect(() => {
    if (!isPreview && messages.length === 0) {
      setMessages([
        { role: 'assistant', text: `Este es un chat de prueba con el asistente de ${businessName || 'tu negocio'}. ¡Hazme una pregunta!` },
      ]);
    }
  }, [isPreview, businessName, messages.length]);


  return (
    <div className="h-[70vh] flex flex-col bg-card border rounded-lg shadow-lg">
      <div className="flex items-center p-3 border-b">
         {logoUrl ? (
            <Avatar className="w-10 h-10">
                <AvatarImage src={logoUrl} alt={`${businessName} logo`} />
                <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback>
            </Avatar>
        ) : (
             <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback>
            </Avatar>
        )}
        <div className="ml-3">
            <p className="text-sm font-semibold">{businessName || "Asistente Virtual"}</p>
            <p className="text-xs text-green-500">En línea</p>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'items-end'}`}>
              {msg.role === 'assistant' && (
                <Avatar className="w-8 h-8">
                  {logoUrl ? <AvatarImage src={logoUrl} /> : <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback> }
                </Avatar>
              )}
              <div className={`rounded-lg p-3 max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{msg.text}</p>
              </div>
              {msg.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8">
                   <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 max-w-lg bg-muted flex items-center">
                    <Loader2 className="animate-spin h-5 w-5" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isPreview ? "La interacción está desactivada en la previsualización." : "Escribe tu mensaje..."}
          disabled={isLoading || isPreview}
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading || !input.trim() || isPreview}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
       <footer className="text-center text-xs text-muted-foreground p-2 border-t">
        Creado con <Bot className="inline w-3 h-3 text-primary"/> OBNKodeX
      </footer>
    </div>
  );
}
