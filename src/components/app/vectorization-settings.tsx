
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Layers, Ruler as RulerIcon } from 'lucide-react';

type VectorizationSettingsProps = {
  detailLevel: number[];
  setDetailLevel: (value: number[]) => void;
  smoothness: number[];
  setSmoothness: (value: number[]) => void;
  removeBackground: boolean;
  setRemoveBackground: (value: boolean) => void;
  singlePath: boolean;
  setSinglePath: (value: boolean) => void;
};

export function VectorizationSettings({
  detailLevel,
  setDetailLevel,
  smoothness,
  setSmoothness,
  removeBackground,
  setRemoveBackground,
  singlePath,
  setSinglePath,
}: VectorizationSettingsProps) {
  return (
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
  );
}
