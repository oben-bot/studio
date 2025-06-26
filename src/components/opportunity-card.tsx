'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Lightbulb, Loader2, Clock, AlertTriangle, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';
import { getClassifyAndSuggest, ClassifyOpportunityOutput, SuggestMonetizationStrategyOutput, Opportunity, getRedemptionStepsAction } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';

const getPlatformUrl = (platform: string, title: string): string => {
  const sanitizedPlatform = platform.toLowerCase();
  if (sanitizedPlatform.includes('mercado libre')) {
    return `https://listado.mercadolibre.com.mx/${encodeURIComponent(title.replace(/\s+/g, '-'))}`;
  }
  if (sanitizedPlatform.includes('amazon')) {
    return `https://www.amazon.com.mx/s?k=${encodeURIComponent(title)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${platform} ${title}`)}`;
};

const parseExpiryString = (expiry?: string): Date | null => {
    if (!expiry) return null;
    try {
        const isoDate = new Date(expiry);
        if (!isNaN(isoDate.getTime())) return isoDate;
    } catch (e) { /* ignore */ }

    const now = new Date();
    const match = expiry.match(/(\d+)\s+(d[íi]a|hora|minuto)s?/i);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('d')) now.setDate(now.getDate() + value);
        if (unit.startsWith('h')) now.setHours(now.getHours() + value);
        if (unit.startsWith('m')) now.setMinutes(now.getMinutes() + value);
        return now;
    }
    return null;
}

const getRiskVariant = (risk: string): 'default' | 'secondary' | 'destructive' => {
  const lowerRisk = risk.toLowerCase();
  if (lowerRisk.includes('alto') || lowerRisk.includes('high')) return 'destructive';
  if (lowerRisk.includes('medio') || lowerRisk.includes('medium')) return 'default';
  return 'secondary';
};

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [analysis, setAnalysis] = useState<{
    classification: ClassifyOpportunityOutput | null;
    suggestion: SuggestMonetizationStrategyOutput | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<string[] | null>(null);
  const [isStepsLoading, setIsStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!opportunity.expiry) return;

    const expiryDate = parseExpiryString(opportunity.expiry);
    if (!expiryDate) return;

    const updateTimer = () => {
      const now = new Date();
      if (expiryDate < now) {
        setTimeLeft('Expirado');
        setIsUrgent(false);
        if (intervalId) clearInterval(intervalId);
        return;
      }
      
      const hoursRemaining = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      setTimeLeft(formatDistanceToNow(expiryDate, { addSuffix: true, locale: es }));
      setIsUrgent(hoursRemaining < 6);
    };
    
    updateTimer();
    const intervalId = setInterval(updateTimer, 60000);

    return () => clearInterval(intervalId);
  }, [opportunity.expiry]);


  const handleAnalysis = async () => {
    if (analysis) return;
    setIsLoading(true);
    setError(null);
    const result = await getClassifyAndSuggest(opportunity);
    if (result.error) {
      setError(result.error);
    } else {
      setAnalysis({ classification: result.classification, suggestion: result.suggestion });
    }
    setIsLoading(false);
  };
  
  const handleGetSteps = async () => {
    if (steps) return;
    setIsStepsLoading(true);
    setStepsError(null);
    const result = await getRedemptionStepsAction(opportunity);
    if (result.error) {
      setStepsError(result.error);
    } else {
      setSteps(result.steps);
    }
    setIsStepsLoading(false);
  };

  return (
    <Card className="flex flex-col border-border hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-primary/20">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="font-bold">{opportunity.title}</CardTitle>
          {isUrgent && (
            <Badge variant="destructive" className="flex-shrink-0 animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              URGENTE
            </Badge>
          )}
        </div>
        <CardDescription>{opportunity.platform}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          {opportunity.estimatedMargin && <Badge variant="outline" className="border-green-500/50 text-green-400"><TrendingUp className="h-3 w-3 mr-1.5" /> Margen: {opportunity.estimatedMargin}</Badge>}
          {timeLeft && <Badge variant="outline" className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {timeLeft}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{opportunity.details}</p>
        
        <Accordion type="single" collapsible onValueChange={handleAnalysis}>
          <AccordionItem value="analysis" className="border-b-0">
            <AccordionTrigger className="text-primary hover:no-underline p-2 rounded-md hover:bg-primary/10">
                {'Analizar Estrategia'}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {isLoading && <div className="space-y-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3" /></div>}
              {error && <p className="text-destructive text-sm">{error}</p>}
              {analysis && (
                <div className="space-y-4 text-sm">
                  {analysis.classification && (
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Clasificación</h4>
                      <p><strong>Prioridad:</strong> {analysis.classification.priorityScore}/10</p>
                      <p className="flex items-center gap-2"><strong>Riesgo:</strong> <Badge variant={getRiskVariant(analysis.classification.riskAssessment)}>{analysis.classification.riskAssessment}</Badge></p>
                    </div>
                  )}
                  {analysis.suggestion && (
                    <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" />Estrategia Sugerida</h4>
                      <p><strong>Acción:</strong> {analysis.suggestion.monetizationStrategy}</p>
                      <p className="text-muted-foreground italic">"{analysis.suggestion.reasoning}"</p>
                    </div>
                  )}

                  <div className="pt-2">
                    { !isStepsLoading && !steps && !stepsError && (
                      <Button onClick={handleGetSteps} variant="outline" size="sm" className="w-full">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Mostrar pasos para canjear
                      </Button>
                    )}
                    {isStepsLoading && <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Generando pasos...</div>}
                    {stepsError && <p className="text-destructive text-sm mt-2">{stepsError}</p>}
                    {steps && (
                      <div className="mt-2 space-y-2">
                          <h4 className="font-semibold flex items-center gap-2"><HelpCircle className="w-4 h-4 text-primary" />Pasos para Canjear</h4>
                          <ol className="list-decimal list-inside space-y-1 text-muted-foreground pl-2">
                              {steps.map((step, index) => <li key={index}>{step}</li>)}
                          </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="default">
          <a href={getPlatformUrl(opportunity.platform, opportunity.title)} target="_blank" rel="noopener noreferrer">
            Ver Oferta <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
