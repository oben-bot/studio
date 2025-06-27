'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Wand2, Settings, Download, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { vectorizeImage } from '@/ai/flows/vectorize-image-flow';

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [isVectorizing, setIsVectorizing] = useState(false);
  const { toast } = useToast();

  const [detailLevel, setDetailLevel] = useState([50]);
  const [smoothness, setSmoothness] = useState([75]);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [singlePath, setSinglePath] = useState(true);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setSvgResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVectorize = async () => {
    if (!imagePreview) {
      toast({
        title: "Error",
        description: "Por favor, sube una imagen primero.",
        variant: "destructive",
      });
      return;
    }

    setIsVectorizing(true);
    setSvgResult(null);

    try {
      const result = await vectorizeImage({
        imageDataUri: imagePreview,
        detailLevel: detailLevel[0],
        smoothness: smoothness[0],
        removeBackground: removeBackground,
        singlePath: singlePath,
      });
      setSvgResult(result.svgString);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de Vectorización",
        description: "La IA no pudo procesar la imagen. Por favor, intenta de nuevo o con otra imagen.",
        variant: "destructive",
      });
    } finally {
      setIsVectorizing(false);
    }
  };
  
  const handleDownload = () => {
    if (!svgResult) return;
    const blob = new Blob([svgResult], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vectorized-image.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Vectorizador Inteligente</h1>
          </div>
          <Button onClick={handleDownload} disabled={!svgResult}>
            <Download className="mr-2 h-4 w-4" />
            Descargar SVG
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Subir Imagen</TabsTrigger>
                <TabsTrigger value="ai"><Wand2 className="mr-2 h-4 w-4" />Crear con IA</TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Cargar una imagen</CardTitle>
                    <CardDescription>Sube un archivo JPG, PNG o BMP para vectorizar.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input id="picture" type="file" onChange={handleImageUpload} accept="image/png, image/jpeg, image/bmp" />
                      <p className="text-xs text-muted-foreground">La inteligencia artificial analizará tu imagen para crear un vector limpio y preciso.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai">
                <Card>
                  <CardHeader>
                    <CardTitle>Descríbelo con IA</CardTitle>
                    <CardDescription>Describe la imagen que quieres crear y nuestra IA la generará por ti.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                       <Textarea placeholder="Ej: Un logo de un león geométrico, estilo minimalista." />
                       <Button className="w-full" disabled><Wand2 className="mr-2 h-4 w-4" />Generar Imagen</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Ajustes de Vectorización</CardTitle>
                <CardDescription>Controla cómo la IA procesa tu imagen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="detail">Nivel de Detalle</Label>
                  <Slider value={detailLevel} onValueChange={setDetailLevel} max={100} step={1} id="detail" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Menos</span>
                    <span>Más</span>
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="smoothness">Suavizado de Curvas</Label>
                  <Slider value={smoothness} onValueChange={setSmoothness} max={100} step={1} id="smoothness" />
                   <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Angular</span>
                    <span>Suave</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="remove-bg" className="flex flex-col space-y-1 cursor-pointer">
                    <span>Eliminar Fondo</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Aislar el objeto principal de la imagen.
                    </span>
                  </Label>
                  <Switch id="remove-bg" checked={removeBackground} onCheckedChange={setRemoveBackground} />
                </div>
                <div className="flex items-center justify-between">
                   <Label htmlFor="single-path" className="flex flex-col space-y-1 cursor-pointer">
                    <span>Trazado Único</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Combinar todas las formas en un solo objeto.
                    </span>
                  </Label>
                  <Switch id="single-path" checked={singlePath} onCheckedChange={setSinglePath} />
                </div>
                 <Button onClick={handleVectorize} disabled={isVectorizing || !imagePreview} className="w-full">
                  {isVectorizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isVectorizing ? "Vectorizando..." : "Vectorizar"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Previsualización</CardTitle>
                <CardDescription>Aquí verás tu imagen original y el resultado vectorizado.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
                  <div className="border-dashed border-2 border-border rounded-lg p-4 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-2">Original</h3>
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center aspect-square">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" width={400} height={400} className="object-contain max-h-full max-w-full" />
                      ) : (
                        <div className="text-center text-muted-foreground">
                           <ImageIcon className="mx-auto h-12 w-12" />
                          <p>Sube una imagen para empezar</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-dashed border-2 border-border rounded-lg p-4 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-2">Vectorizado (SVG)</h3>
                     <div className="w-full h-full bg-muted rounded-md flex items-center justify-center aspect-square">
                        {isVectorizing ? (
                          <div className="text-center text-muted-foreground">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                            <p>La IA está trabajando...</p>
                          </div>
                        ) : svgResult ? (
                          <div
                            className="w-full h-full p-4"
                            dangerouslySetInnerHTML={{ __html: svgResult }}
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                             <Sparkles className="mx-auto h-12 w-12" />
                            <p>El resultado aparecerá aquí</p>
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
