import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Handshake, Target, Clock } from 'lucide-react';

export function OpportunityCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="text-primary" />
                    Oportunidades Generadas
                </CardTitle>
                <CardDescription>
                    Aquí verás los leads que tu asistente ha capturado.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <Clock className="w-12 h-12 mb-4" />
                    <p>Aún no se han generado oportunidades.</p>
                    <p className="text-sm">Entrena a tu asistente y comparte el chat para empezar.</p>
                </div>
            </CardContent>
        </Card>
    );
}
