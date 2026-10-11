import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function stepTitle(node: ReactNode): string {
  if (!isValidElement<{ children?: ReactNode; label?: string; 'data-step-title'?: string }>(node)) return '';
  if (node.props['data-step-title'] || node.props.label) return node.props['data-step-title'] || node.props.label!;
  const first = Children.toArray(node.props.children)[0];
  return typeof first === 'string' ? first : stepTitle(first);
}

function stepContent(node: ReactNode): ReactNode {
  if (!isValidElement<{ children?: ReactNode }>(node) || node.type !== 'label') return node;
  return cloneElement(node, {}, Children.toArray(node.props.children).map((child, index) => typeof child === 'string' ? <span key={index} className="sr-only">{child}</span> : child));
}

export function ContributionWizard({ children, category, rules, onSubmit, footer, busy, preview }: {
  children: ReactNode; category: string; rules: Record<string, boolean>; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  footer: ReactNode; busy: boolean; preview?: ReactNode;
}) {
  const steps = Children.toArray(children);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  useEffect(() => { setStep(0); setError(''); }, [category]);
  useEffect(() => {
    if (mounted.current) heading.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [step]);
  function validate(index: number) {
    const panel = form.current?.querySelector(`[data-contribution-step="${index}"]`);
    const title = stepTitle(steps[index]);
    const invalid = [...(panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea') || [])].find(input => !input.checkValidity());
    if (invalid) { setError('Confira os campos desta etapa.'); if (index === step) { if (invalid.getClientRects().length) invalid.focus(); else panel?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus(); } return false; }
    if (rules[title] === false) { setError('Preencha as informações desta etapa para continuar.'); return false; }
    setError('');
    return true;
  }
  function next() { if (validate(step)) setStep(current => Math.min(current + 1, steps.length - 1)); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (step < steps.length - 1) { next(); return; }
    for (let i = 0; i < steps.length - 1; i++) {
      if (!validate(i)) { setStep(i); return; }
    }
    onSubmit(event);
  }
  return <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_280px]"><form data-contribution-form ref={form} noValidate onSubmit={submit} className="min-w-0 overflow-hidden rounded-lg border bg-card">
    <div className="space-y-3 border-b px-5 py-4 sm:px-8">
      <p aria-live="polite" className="text-xs text-muted-foreground">Etapa {step + 1} de {steps.length}</p>
      <Progress aria-label="Progresso da sugestão" value={(step + 1) / steps.length * 100} className="h-1" />
    </div>
    <div className="min-h-72 space-y-6 p-5 sm:p-8">
      <h2 ref={heading} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">{stepTitle(steps[step])}</h2>
      {steps.map((content, index) => <div key={stepTitle(content)} data-contribution-step={index} hidden={step !== index} className="space-y-4 [&>label]:text-base [&>label]:font-normal [&>fieldset]:border-0 [&>fieldset]:p-0 [&>fieldset>legend]:sr-only">{stepContent(content)}</div>)}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
    <div className="flex items-center justify-between gap-3 border-t bg-muted/10 px-5 py-5 sm:px-8 sm:py-8">
      <Button type="button" variant="outline" disabled={step === 0 || busy} onClick={() => { setError(''); setStep(current => current - 1); }}><ArrowLeft />Voltar</Button>
      {step < steps.length - 1 && <Button type="button" disabled={busy} onClick={next}>Continuar<ArrowRight /></Button>}
    </div>
    {footer && <div className="px-5 pb-5 sm:px-8">{footer}</div>}
  </form>{preview&&<div className="hidden md:block">{preview}</div>}</div>;
}
