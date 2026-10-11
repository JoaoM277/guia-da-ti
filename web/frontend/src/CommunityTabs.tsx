import {Facebook,Github,Linkedin,Users,Ellipsis,Send,Globe2,ChevronLeft,ChevronRight} from 'lucide-react';
import {Tabs} from 'radix-ui';
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {Button} from '@/components/ui/button';

function BrandIcon({className,children}:{className?:string;children:ReactNode}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{children}</svg>;
}
function WhatsAppIcon({className}:{className?:string}) {
  return <BrandIcon className={className}><path d="M21 11.5a9 9 0 0 1-13.5 7.8L3 21l1.6-4.4A9 9 0 1 1 21 11.5Z"/><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 2-2 2-4 1-3-1-6-4-7-7-1-2 0-3 2-3Z"/></BrandIcon>;
}
function DiscordIcon({className}:{className?:string}) {
  return <BrandIcon className={className}><path d="m8 5-3 1c-2 3-3 7-3 11l5 3 1-2m8-13 3 1c2 3 3 7 3 11l-5 3-1-2M8 5l1 2m7-2-1 2M6 16c4 2 8 2 12 0"/><ellipse cx="8.5" cy="12" rx="1" ry="1.5"/><ellipse cx="15.5" cy="12" rx="1" ry="1.5"/></BrandIcon>;
}
function RedditIcon({className}:{className?:string}) {
  return <BrandIcon className={className}><ellipse cx="12" cy="15" rx="9" ry="6"/><path d="m12 9 1-6 5 1M8 17c2 2 6 2 8 0"/><circle cx="20" cy="4" r="2"/><path d="M4 11c-3-3-5 2-1 3m17-3c3-3 5 2 1 3"/><circle cx="8.5" cy="14" r=".7" fill="currentColor"/><circle cx="15.5" cy="14" r=".7" fill="currentColor"/></BrandIcon>;
}
const platforms=[
  {id:'all',name:'Geral',Icon:Users}, {id:'whatsapp',name:'WhatsApp',Icon:WhatsAppIcon},
  {id:'telegram',name:'Telegram',Icon:Send}, {id:'discord',name:'Discord',Icon:DiscordIcon},
  {id:'facebook',name:'Facebook',Icon:Facebook}, {id:'linkedin',name:'LinkedIn',Icon:Linkedin},
  {id:'reddit',name:'Reddit',Icon:RedditIcon}, {id:'github',name:'GitHub',Icon:Github}, {id:'website',name:'Site próprio',Icon:Globe2}, {id:'other',name:'Outra',Icon:Ellipsis},
];
export function CommunityTabs() {
  const listRef=useRef<HTMLDivElement>(null);
  const [edges,setEdges]=useState({overflow:false,left:false,right:false});
  const updateEdges=useCallback(()=>{
    const list=listRef.current;
    if(!list)return;
    setEdges({overflow:list.scrollWidth>list.clientWidth+1,left:list.scrollLeft>1,right:list.scrollLeft+list.clientWidth<list.scrollWidth-1});
  },[]);
  useEffect(()=>{
    const list=listRef.current;
    if(!list)return;
    updateEdges();
    list.addEventListener('scroll',updateEdges,{passive:true});
    const observer=new ResizeObserver(updateEdges);
    observer.observe(list);
    return()=>{list.removeEventListener('scroll',updateEdges);observer.disconnect();};
  },[updateEdges]);
  function slide(direction:-1|1) {
    const list=listRef.current;
    if(!list)return;
    const bounds=list.getBoundingClientRect();
    const tabs=Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
    const visibleStart=tabs.findIndex(tab=>tab.getBoundingClientRect().right>bounds.left+1);
    let visibleEnd=-1;
    tabs.forEach((tab,index)=>{if(tab.getBoundingClientRect().left<bounds.right-1)visibleEnd=index;});
    const target=tabs[direction>0?Math.min(tabs.length-1,visibleEnd+1):Math.max(0,visibleStart-1)];
    if(!target)return;
    list.scrollTo({left:list.scrollLeft+target.getBoundingClientRect().left-bounds.left,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return <div className="flex min-w-0 items-center gap-1 border-b">
    {edges.overflow&&edges.left&&<Button type="button" variant="outline" size="icon-xs" aria-label="Deslizar plataformas para a esquerda" className="shrink-0 bg-background shadow-sm sm:hidden" onClick={()=>slide(-1)}><ChevronLeft aria-hidden="true"/></Button>}
    <Tabs.List ref={listRef} aria-label="Plataformas das comunidades" className="flex min-w-0 flex-1 flex-nowrap gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-full sm:flex-wrap sm:overflow-visible">
      {platforms.map(({id,name,Icon})=><Tabs.Trigger key={id} value={id} className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"><Icon className="size-4 shrink-0" aria-hidden="true"/>{name}</Tabs.Trigger>)}
    </Tabs.List>
    {edges.overflow&&edges.right&&<Button type="button" variant="outline" size="icon-xs" aria-label="Deslizar plataformas para a direita" className="shrink-0 bg-background shadow-sm sm:hidden" onClick={()=>slide(1)}><ChevronRight aria-hidden="true"/></Button>}
  </div>;
}
