'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { identifyOpportunities, Opportunity } from '@/app/actions';
import { OpportunityCard } from './opportunity-card';
import { AlertCircle, Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  opportunities: [] as Opportunity[],
  error: null as string | null | undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Identificar Oportunidades
    </Button>
  );
}

export function OpportunityHunter() {
  const [state, formAction] = useActionState(identifyOpportunities, initialState);

  return (
    <div className="space-y-8">
      <Card className="border-primary/30 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl">Encuentra tu Próxima Oportunidad</CardTitle>
          <CardDescription>
            Pega aquí los datos del e-commerce (promociones, listados de productos, etc.) para que la IA los analice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Textarea
              name="ecommerceData"
              placeholder="Ej: 'Cupón de 20% en Liverpool para audífonos, vence en 2 días. Oferta en Coppel: 3x2 en llantas. En Amazon MX, kit de herramientas a $1200...'"
              rows={8}
              className="bg-background/50 focus:border-primary"
              required
            />
            <SubmitButton />
            {state?.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {state?.opportunities && state.opportunities.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Oportunidades Encontradas</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {state.opportunities.map((opp, index) => (
              <OpportunityCard key={`${opp.title}-${index}`} opportunity={opp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
