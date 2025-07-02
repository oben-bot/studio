
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import { 
  Scissors, Combine, Paintbrush, Box, Type, Shapes, Pencil, UploadCloud, Rocket, FileImage, Hexagon
} from 'lucide-react';
import type { WorkType, CorteSubType, ThreeDSubType, FontType } from '@/lib/definitions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SetupWizardProps = {
  workType: WorkType;
  setWorkType: (value: WorkType) => void;
  corteSubType: CorteSubType;
  setCorteSubType: (value: CorteSubType) => void;
  threeDSubType: ThreeDSubType;
  setThreeDSubType: (value: ThreeDSubType) => void;
  fontType: FontType;
  setFontType: (value: FontType) => void;
  previewFont: FontType;
  setPreviewFont: (value: FontType) => void;
  textInput: string;
  setTextInput: (value: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isProcessing: boolean;
  handleSetupGenerate: () => void;
  isSetupComplete: () => boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
};

export function SetupWizard({
  workType, setWorkType, corteSubType, setCorteSubType, threeDSubType, setThreeDSubType,
  fontType, setFontType, previewFont, setPreviewFont, textInput, setTextInput, selectedFile, setSelectedFile, 
  isProcessing, handleSetupGenerate, isSetupComplete, fileInputRef,
}: SetupWizardProps) {

  const fontOptions: { value: FontType; label: string }[] = [
    { value: 'sans-serif', label: 'Sans Serif (Moderna)' },
    { value: 'serif', label: 'Serif (Clásica)' },
    { value: 'script', label: 'Script (Genérica)' },
    { value: 'elegant-script', label: 'Script (Elegante)' },
    { value: 'vintage-script', label: 'Script (Vintage)' },
    { value: 'flowing-cursive', label: 'Cursiva Fluida' },
    { value: 'calligraphy', label: 'Caligrafía' },
    { value: 'modern-calligraphy', label: 'Caligrafía Moderna' },
    { value: 'signature', label: 'Firma' },
    { value: 'handwriting', label: 'Manuscrita' },
    { value: 'gothic', label: 'Gótico' },
    { value: 'blackletter', label: 'Blackletter (Antigua)' },
    { value: 'display', label: 'Display (Decorativa)' },
    { value: 'decorative', label: 'Decorativa (Genérica)' },
    { value: 'art deco', label: 'Art Deco' },
    { value: 'grunge', label: 'Grunge (Urbano)' },
    { value: 'stencil', label: 'Stencil (Plantilla)' },
    { value: 'graffiti', label: 'Graffiti' },
    { value: 'futuristic', label: 'Futurista' },
    { value: 'retro', label: 'Retro' },
    { value: 'monospace', label: 'Monospace (Máquina de escribir)' },
    { value: 'comic', label: 'Comic' },
    { value: 'pixel', label: 'Pixel' },
    { value: 'rounded', label: 'Redondeada' },
    { value: 'fantasy', label: 'Fantasía' },
  ];

  const getFontClass = (font: FontType | '') => {
    switch (font) {
      case 'sans-serif': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'script':
      case 'elegant-script':
      case 'vintage-script':
      case 'flowing-cursive':
      case 'calligraphy':
      case 'modern-calligraphy':
      case 'signature':
      case 'handwriting':
        return "font-['cursive']";
      case 'gothic': return 'font-semibold tracking-wider';
      case 'display': return 'font-bold tracking-widest';
      case 'monospace': return 'font-mono';
      case 'fantasy': return "font-['fantasy']";
      case 'blackletter': return 'font-serif font-black';
      case 'stencil': return 'font-mono uppercase';
      case 'futuristic': return 'font-sans uppercase tracking-widest';
      case 'retro': return "font-['fantasy']";
      case 'comic': return "font-['Comic_Sans_MS',_cursive]";
      case 'graffiti': return "font-['Impact']";
      case 'pixel': return 'font-mono';
      case 'rounded': return 'font-sans';
      case 'grunge': return 'font-sans';
      case 'art deco': return 'font-sans uppercase';
      case 'decorative': return "font-['fantasy'] tracking-wider";
      default: return 'font-sans';
    }
  };
  
  const getIdeaStepNumber = () => {
    if (workType === 'corte') return 3;
    if (workType === '3d') return 2;
    return 2;
  }

  const getFontStepNumber = () => {
     if (workType === 'corte' && corteSubType === 'nombre') return 4;
     return 3;
  }
  
  const showIdeaCard = workType && (workType !== 'corte' || !!corteSubType) && (workType !== '3d' || !!threeDSubType);
  const showFontCard = workType === 'corte' && corteSubType === 'nombre' && !!textInput.trim();

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>1. Elige el tipo de trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={workType} onValueChange={(val) => setWorkType(val as WorkType)}>
            <div className="grid grid-cols-2 gap-4">
              <Label htmlFor="corte" className="p-4 border rounded-md cursor-pointer has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary">
                <RadioGroupItem value="corte" id="corte" className="sr-only"/>
                <Scissors className="mb-2"/> <span className="font-semibold">Corte</span>
              </Label>
              <Label htmlFor="corte-grabado" className="p-4 border rounded-md cursor-pointer has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary">
                <RadioGroupItem value="corte-grabado" id="corte-grabado" className="sr-only"/>
                <Combine className="mb-2"/> <span className="font-semibold">Corte y Grabado</span>
              </Label>
              <Label htmlFor="grabado" className="p-4 border rounded-md cursor-pointer has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary">
                <RadioGroupItem value="grabado" id="grabado" className="sr-only"/>
                <Paintbrush className="mb-2"/> <span className="font-semibold">Grabado</span>
              </Label>
              <Label htmlFor="3d" className="p-4 border rounded-md cursor-pointer has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary">
                <RadioGroupItem value="3d" id="3d" className="sr-only"/>
                <Box className="mb-2"/> <span className="font-semibold">3D</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {workType === 'corte' && (
        <Card>
          <CardHeader><CardTitle>2. Especifica el tipo de corte</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={corteSubType} onValueChange={(val) => setCorteSubType(val as CorteSubType)}>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 p-3 border rounded-md"><RadioGroupItem value="nombre" /> <Type className="w-4 h-4"/> Nombre</Label>
              <Label className="flex items-center gap-2 p-3 border rounded-md"><RadioGroupItem value="figura" /> <Shapes className="w-4 h-4"/> Figura</Label>
              <Label className="flex items-center gap-2 p-3 border rounded-md"><RadioGroupItem value="contorno" /> <Pencil className="w-4 h-4"/> Contorno</Label>
              <Label className="flex items-center gap-2 p-3 border rounded-md"><RadioGroupItem value="forma" /> <Hexagon className="w-4 h-4"/> Forma</Label>
            </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {workType === '3d' && (
        <Card>
            <CardHeader><CardTitle>2. ¿Diseño nuevo o existente?</CardTitle></CardHeader>
            <CardContent>
                <RadioGroup value={threeDSubType} onValueChange={(val) => setThreeDSubType(val as ThreeDSubType)}>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 p-3 border rounded-md"><RadioGroupItem value="nuevo"/> <Pencil className="w-4 h-4"/> Diseño Nuevo</Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-md"><RadioGroupItem value="existente"/> <FileImage className="w-4 h-4"/> Diseño Existente</Label>
                  </div>
                </RadioGroup>
            </CardContent>
        </Card>
      )}

      {showIdeaCard && (
        <Card>
          <CardHeader><CardTitle>{getIdeaStepNumber()}. Proporciona tu idea</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            { !(workType === '3d' && threeDSubType === 'existente') && (
              <div>
                <Label htmlFor="text-prompt" className="mb-2 block">
                  {workType === 'corte' && corteSubType === 'nombre' ? 'Escribe el texto a diseñar' : 'Describe tu idea'}
                </Label>
                <Input id="text-prompt" placeholder="Ej: un león, el nombre 'Sofía'..." value={textInput} onChange={e => setTextInput(e.target.value)} />
              </div>
            )}
            
            {workType === 'corte' && corteSubType === 'nombre' && textInput && (
              <div className="mt-2 p-4 border rounded-md text-center bg-muted/50">
                <p className={cn("text-4xl font-bold transition-all duration-200", getFontClass(previewFont || fontType))}>
                  {textInput}
                </p>
              </div>
            )}

            { !(workType === 'corte' && corteSubType === 'nombre') && !(workType === '3d' && threeDSubType === 'nuevo') && (
              <>
                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-card px-2 text-sm text-muted-foreground">O</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                />
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="mr-2"/> Subir una imagen
                </Button>
                {selectedFile && <p className="text-sm text-center text-muted-foreground mt-2">Archivo seleccionado: {selectedFile.name}</p>}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {showFontCard && (
        <Card>
          <CardHeader>
            <CardTitle>{getFontStepNumber()}. Elige el tipo de fuente</CardTitle>
            <CardDescription>
              Selecciona un estilo. Pasa el cursor sobre las opciones para previsualizar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={fontType} onValueChange={(val) => setFontType(val as FontType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estilo de fuente..." />
              </SelectTrigger>
              <SelectContent onMouseLeave={() => setPreviewFont('')} side="bottom" avoidCollisions={false}>
                {fontOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    onMouseEnter={() => setPreviewFont(option.value)}
                  >
                    <span className={getFontClass(option.value)}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {isSetupComplete() && (
        <div className="mt-2">
            <Button className="w-full" size="lg" disabled={isProcessing} onClick={handleSetupGenerate}>
              <Rocket className="mr-2"/> Generar Diseño
            </Button>
        </div>
      )}
    </div>
  );
}
