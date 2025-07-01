
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  Scissors, Combine, Paintbrush, Box, Type, Shapes, Pencil, UploadCloud, Rocket, FileImage, Hexagon
} from 'lucide-react';
import type { WorkType, CorteSubType, ThreeDSubType } from '@/lib/definitions';

type SetupWizardProps = {
  workType: WorkType;
  setWorkType: (value: WorkType) => void;
  corteSubType: CorteSubType;
  setCorteSubType: (value: CorteSubType) => void;
  threeDSubType: ThreeDSubType;
  setThreeDSubType: (value: ThreeDSubType) => void;
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
  textInput, setTextInput, selectedFile, setSelectedFile, isProcessing,
  handleSetupGenerate, isSetupComplete, fileInputRef,
}: SetupWizardProps) {
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

      {workType && ( (workType !== 'corte' && workType !== '3d') || (workType === 'corte' && corteSubType) || (workType === '3d' && threeDSubType)) && (
        <Card>
          <CardHeader><CardTitle>3. Proporciona tu idea</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            { !(workType === '3d' && threeDSubType === 'existente') && (
              <div>
                <Label htmlFor="text-prompt" className="mb-2 block">Describe tu idea o escribe el texto a usar</Label>
                <Input id="text-prompt" placeholder="Ej: un león geométrico, el nombre 'Sofía'..." value={textInput} onChange={e => setTextInput(e.target.value)} />
              </div>
            )}
            { !(workType === 'corte' && corteSubType === 'nombre') && !(workType === '3d' && threeDSubType === 'nuevo') && (
              <>
                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-background px-2 text-sm text-muted-foreground">O</span>
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
            <CardFooter>
              <Button className="w-full" size="lg" disabled={!isSetupComplete() || isProcessing} onClick={handleSetupGenerate}>
                <Rocket className="mr-2"/> Generar Diseño
              </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
