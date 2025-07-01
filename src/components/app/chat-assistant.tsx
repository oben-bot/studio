
'use client';

import { useEffect, useRef, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, LoaderCircle } from 'lucide-react';
import type { ChatMessage } from '@/lib/definitions';

type ChatAssistantProps = {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  handleChatSubmit: (e?: FormEvent) => void;
  isProcessing: boolean;
};

export function ChatAssistant({
  chatMessages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  isProcessing
}: ChatAssistantProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isProcessing]);

  return (
    <Card className="flex flex-col flex-grow h-[calc(100vh-270px)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bot /> Asistente IA</CardTitle>
        <CardDescription>Pide ajustes sobre el diseño actual.</CardDescription>
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
        <form onSubmit={handleChatSubmit} className="relative w-full flex items-center gap-2">
          <Textarea
            placeholder="Ej: hazlo más grueso, con estilo gótico..."
            className="pr-12"
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
          <Button type="submit" size="icon" className="absolute right-2" disabled={isProcessing || !chatInput.trim()}>
            <Send />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
