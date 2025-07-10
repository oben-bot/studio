
'use client';

import { useState, useRef, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { runAgent } from '@/ai/flows/conversational-flow';
import { vectorizeImage } from '@/ai/flows/vectorize-image-flow';
import type { ChatMessage, UiMode, WorkType, CorteSubType, ThreeDSubType, FontType } from '@/lib/definitions';

export function useWorkflow() {
  const { toast } = useToast();
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for vectorization settings
  const [detailLevel, setDetailLevel] = useState([50]);
  const [smoothness, setSmoothness] = useState([75]);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [singlePath, setSinglePath] = useState(true);

  // States for UI mode and workflow
  const [mode, setMode] = useState<UiMode>('setup');
  const [workType, setWorkType] = useState<WorkType>('');
  const [corteSubType, setCorteSubType] = useState<CorteSubType>('');
  const [threeDSubType, setThreeDSubType] = useState<ThreeDSubType>('');
  const [fontType, setFontType] = useState<FontType>('');
  const [previewFont, setPreviewFont] = useState<FontType>('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // States for chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const processImageFile = async (file: File) => {
    if (!file || isProcessing) return;
    
    setIsProcessing(true);
    setSvgResult(null);

    const userMessage: ChatMessage = { role: 'user', content: `Vectorizando la imagen: ${file.name}` };
    setChatMessages(prev => [...prev, userMessage]);
    setMode('chat'); // Switch to chat mode

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
          const assistantMessage: ChatMessage = { role: 'assistant', content: '¡Imagen vectorizada! Puedes usar el chat para pedir ajustes, o exportarla.' };
          setChatMessages(prev => [...prev, assistantMessage]);
        } else {
           throw new Error('La IA no pudo generar un SVG.');
        }
      } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error al vectorizar la imagen.' };
        setChatMessages(prev => [...prev, errorMessage]);
        toast({ variant: 'destructive', title: 'Error de Vectorización' });
      } finally {
        setIsProcessing(false);
        setSelectedFile(null);
      }
    };
     reader.onerror = (error) => {
      console.error("Error reading file:", error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Ocurrió un error al leer el archivo.' };
      setChatMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      setSelectedFile(null);
    };
  };

  const processTextPrompt = async (prompt: string, userFacingPrompt: string) => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setSvgResult(null);
    
    const userMessage: ChatMessage = { role: 'user', content: userFacingPrompt };
    setChatMessages([userMessage]); // Start a new conversation
    setMode('chat'); // Switch to chat mode

    try {
      const result = await runAgent({
        prompt: prompt,
        detailLevel: detailLevel[0],
        smoothness: smoothness[0],
        removeBackground,
        singlePath,
        font: fontType,
      });

      if (result.textResponse) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: result.textResponse };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
      if (result.svgString) {
        setSvgResult(result.svgString);
      }
      if (!result.textResponse && !result.svgString) {
        throw new Error("El agente no devolvió una respuesta válida.")
      }

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error.' };
      setChatMessages(prev => [...prev, errorMessage]);
      toast({ variant: 'destructive', title: 'Error de Generación' });
    } finally {
      setIsProcessing(false);
      // No clearing textInput so user can re-generate
    }
  }

  const handleChatSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const currentPrompt = chatInput;
    const userMessage: ChatMessage = { role: 'user', content: currentPrompt };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsProcessing(true);
    
    try {
      const result = await runAgent({
        prompt: currentPrompt,
        detailLevel: detailLevel[0],
        smoothness: smoothness[0],
        removeBackground,
        singlePath,
        font: fontType, // Pass font type for contextual adjustments
      });

      if (result.textResponse) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: result.textResponse };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
      if (result.svgString) {
        setSvgResult(result.svgString);
      }

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'assistant', content: 'Lo siento, un error ocurrió.' };
      setChatMessages(prev => [...prev, errorMessage]);
      toast({ variant: 'destructive', title: 'Error del Asistente' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetupGenerate = () => {
    // If a file is selected and the flow is primarily image-based, process the image.
    if (selectedFile) {
      const isImageFlow = (workType === 'corte' && corteSubType !== 'nombre') ||
                           workType === 'corte-grabado' ||
                           workType === 'grabado' ||
                           (workType === '3d' && threeDSubType === 'existente');
      if (isImageFlow) {
        processImageFile(selectedFile);
        return;
      }
    }
    
    let prompt = '';
    let userFacingPrompt = textInput;

    // For text prompts, we build a simple, direct prompt for the AI.
    if (workType === 'corte') {
        if (corteSubType === 'nombre') {
          prompt = textInput; // For names, the prompt is just the text itself. The font is a separate parameter.
        }
        else if (corteSubType === 'figura') prompt = `A simple figure of ${textInput} for laser cutting, like a silhouette or stencil.`;
        else if (corteSubType === 'contorno') prompt = `The outline of ${textInput} for laser cutting.`;
        else if (corteSubType === 'forma') prompt = `An abstract shape based on "${textInput}" for laser cutting.`;
    } else if (workType === 'corte-grabado') {
        prompt = `A design of "${textInput}" for laser cutting and engraving, with well-defined areas for each process.`;
    } else if (workType === 'grabado') {
        prompt = `A detailed design of "${textInput}" for laser engraving.`;
    } else if (workType === '3d' && threeDSubType === 'nuevo') {
        prompt = `A design of ${textInput} that simulates a layered 3D effect for laser cutting.`;
    }
    
    if (prompt.trim()) {
        processTextPrompt(prompt, userFacingPrompt);
    } else if (selectedFile) { // Fallback to image processing if no text prompt was built but a file exists
        processImageFile(selectedFile);
    }
  };

  const isSetupComplete = () => {
    if (!workType) return false;

    switch (workType) {
      case 'corte':
        if (!corteSubType) return false;
        if (corteSubType === 'nombre') {
          return !!textInput.trim() && !!fontType;
        }
        return !!textInput.trim() || !!selectedFile;
      
      case 'corte-grabado':
      case 'grabado':
        return !!textInput.trim() || !!selectedFile;

      case '3d':
        if (!threeDSubType) return false;
        if (threeDSubType === 'nuevo') {
          return !!textInput.trim();
        }
        if (threeDSubType === 'existente') {
          return !!selectedFile;
        }
        return false;

      default:
        return false;
    }
  };

  const resetWorkflow = () => {
    setMode('setup');
    setWorkType('');
    setCorteSubType('');
    setThreeDSubType('');
    setFontType('');
    setPreviewFont('');
    setTextInput('');
    setSelectedFile(null);
    setSvgResult(null);
    setChatMessages([]);
  }

  return {
    // State
    svgResult,
    isProcessing,
    detailLevel,
    setDetailLevel,
    smoothness,
    setSmoothness,
    removeBackground,
    setRemoveBackground,
    singlePath,
    setSinglePath,
    mode,
    setMode,
    workType,
    setWorkType,
    corteSubType,
    setCorteSubType,
    threeDSubType,
    setThreeDSubType,
    fontType,
    setFontType,
    previewFont,
    setPreviewFont,
    textInput,
    setTextInput,
    selectedFile,
    setSelectedFile,
    chatInput,
    setChatInput,
    chatMessages,
    setChatMessages,
    // Refs
    fileInputRef,
    // Handlers
    handleDownload,
    handleChatSubmit,
    handleSetupGenerate,
    isSetupComplete,
    resetWorkflow,
  };
}
