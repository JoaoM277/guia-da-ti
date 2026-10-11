import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import './styles.css';

function AuthComplete() {
  const failed = new URLSearchParams(location.search).get('login') === 'failed';
  useEffect(() => {
    try { document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark'); } catch { /* Optional preference. */ }
    window.opener?.postMessage({ type: 'guia:auth-complete', failed }, location.origin);
    window.close();
  }, [failed]);
  return <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 px-6 py-10">
    <h1 className="text-2xl font-semibold">Volte ao Guia da TI</h1>
    <p className="text-sm leading-relaxed text-muted-foreground">{failed ? 'Não foi possível entrar com o GitHub. Feche esta janela e tente novamente no Guia.' : 'Acesso autorizado. Feche esta janela e continue no Guia.'}</p>
    <Button onClick={() => window.close()}>Fechar janela</Button>
  </main>;
}

createRoot(document.getElementById('root')!).render(<AuthComplete />);
