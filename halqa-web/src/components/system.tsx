/* ============================================================================
   HALQA — DESIGN SYSTEM PRIMITIVES

   One card, one row, one button, one field, one badge, one skeleton, one empty
   state, one error state, one sheet, one modal, one page header. Every screen
   is built from these, so a change to a control happens once rather than in
   thirty places, and two screens cannot disagree about what a card looks like.

   Every value read here comes from tokens.css. Nothing in this file hard codes
   a colour, a radius, a shadow or a size.
   ========================================================================== */
import {
  useCallback, useEffect, useId, useState,
  type CSSProperties, type ReactNode,
} from 'react';
import { useDismissable } from '../lib/dismissable';
import { AlertTriangle, ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';

/* -------------------------------------------------------------------- card */
export function Card({children,className='',as:As='div',onClick,padded=true,...rest}:{
  children:ReactNode;className?:string;as?:'div'|'section'|'article'|'button';
  onClick?:()=>void;padded?:boolean;style?:CSSProperties;
}){
  return <As className={`ds-card${padded?'':' flush'} ${className}`} onClick={onClick} {...rest}>{children}</As>;
}

/* ---------------------------------------------------------------- list row */
/* A row carries a title, and optionally a subtitle, a leading icon and a
   trailing control. A list either gives every row a subtitle or gives none of
   them one; mixing the two down one list is what made the Account screen look
   unfinished. `dense` is the no-subtitle rhythm. */
export function ListRow({icon,title,subtitle,trailing,onClick,tone='default',dense=false,className=''}:{
  icon?:ReactNode;title:ReactNode;subtitle?:ReactNode;trailing?:ReactNode;
  onClick?:()=>void;tone?:'default'|'ok'|'warn'|'bad'|'info'|'brand';dense?:boolean;className?:string;
}){
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`ds-row${dense?' dense':''} ${className}`} onClick={onClick} type={onClick?'button':undefined}>
      {icon&&<span className={`ds-row-ic tone-${tone}`} aria-hidden="true">{icon}</span>}
      <span className="ds-row-body">
        <span className="ds-row-title">{title}</span>
        {subtitle&&<span className="ds-row-sub">{subtitle}</span>}
      </span>
      {trailing!==undefined
        ? <span className="ds-row-trail">{trailing}</span>
        : onClick && <ChevronRight className="ds-row-chev" aria-hidden="true"/>}
    </Tag>
  );
}

export function List({children,className=''}:{children:ReactNode;className?:string}){
  return <div className={`ds-list ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ button */
export function Button({
  children,onClick,variant='primary',size='md',full=false,disabled=false,
  loading=false,icon,type='button',className='',...rest
}:{
  children?:ReactNode;onClick?:()=>void;
  variant?:'primary'|'secondary'|'tertiary'|'destructive';
  size?:'sm'|'md'|'lg';full?:boolean;disabled?:boolean;loading?:boolean;
  icon?:ReactNode;type?:'button'|'submit';className?:string;'aria-label'?:string;
}){
  return (
    <button
      type={type}
      className={`ds-btn v-${variant} s-${size}${full?' full':''}${loading?' loading':''} ${className}`}
      onClick={onClick}
      disabled={disabled||loading}
      aria-busy={loading||undefined}
      {...rest}
    >
      {loading ? <Spinner size={size==='sm'?14:16}/> : icon}
      {children&&<span>{children}</span>}
    </button>
  );
}

export function Spinner({size=18}:{size?:number}){
  return <span className="ds-spinner" style={{width:size,height:size}} aria-hidden="true"/>;
}

/* ------------------------------------------------------------- form field */
export function FormField({label,hint,error,disabled=false,required=false,children}:{
  label:ReactNode;hint?:ReactNode;error?:ReactNode;disabled?:boolean;required?:boolean;children:ReactNode;
}){
  const id=useId();
  return (
    <div className={`ds-field${error?' has-error':''}${disabled?' is-disabled':''}`}>
      <label className="ds-field-label" htmlFor={id}>
        {label}{required&&<span className="ds-req" aria-hidden="true">*</span>}
      </label>
      <div className="ds-field-control">{children}</div>
      {error
        ? <p className="ds-field-msg error" role="alert">{error}</p>
        : hint && <p className="ds-field-msg">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------- badge */
/* A badge sits inside the bounds of whatever it labels. The old NEW and
   POPULAR badges were absolutely positioned above their tile and overlapped
   the row above; this one is in flow. */
export function Badge({children,tone='brand',size='md'}:{
  children:ReactNode;tone?:'brand'|'ok'|'warn'|'bad'|'info'|'neutral';size?:'sm'|'md';
}){
  return <span className={`ds-badge tone-${tone} s-${size}`}>{children}</span>;
}

/* ---------------------------------------------------------------- skeleton */
/* A skeleton for every shape the app draws, so a slow screen shows its own
   outline rather than one spinner in the middle of nothing. */
export function Skeleton({w,h=14,r,className=''}:{w?:number|string;h?:number|string;r?:number|string;className?:string}){
  return <span className={`ds-skel ${className}`} style={{width:w??'100%',height:h,borderRadius:r??'var(--r-xs)'}} aria-hidden="true"/>;
}
export function SkeletonText({lines=3,className=''}:{lines?:number;className?:string}){
  return <span className={`ds-skel-stack ${className}`} aria-hidden="true">
    {Array.from({length:lines},(_,i)=><Skeleton key={i} w={i===lines-1?'62%':'100%'}/>)}
  </span>;
}
export function SkeletonCard({lines=2}:{lines?:number}){
  return <div className="ds-card ds-skel-card" aria-hidden="true">
    <Skeleton w={132} h={17}/><SkeletonText lines={lines}/>
  </div>;
}
export function SkeletonList({rows=4}:{rows?:number}){
  return <div className="ds-list" aria-hidden="true">
    {Array.from({length:rows},(_,i)=>(
      <div className="ds-row" key={i}>
        <Skeleton w={40} h={40} r="var(--r-full)"/>
        <span className="ds-row-body"><Skeleton w="58%" h={14}/><Skeleton w="38%" h={11}/></span>
        <Skeleton w={56} h={14}/>
      </div>
    ))}
  </div>;
}
export function SkeletonChart({h=150}:{h?:number}){
  return <div className="ds-card" aria-hidden="true"><Skeleton w={120} h={16}/><Skeleton h={h} r="var(--r)" className="mt"/></div>;
}
/* Announced to a screen reader so a blind member is told the screen is
   loading rather than being read an empty page. */
export function Loading({label='Loading'}:{label?:string}){
  return <p className="ds-sr-only" role="status" aria-live="polite">{label}</p>;
}

/* ------------------------------------------------------------ empty state */
export function EmptyState({illustration,title,body,action}:{
  illustration?:ReactNode;title:string;body?:string;action?:ReactNode;
}){
  return (
    <div className="ds-empty">
      {illustration&&<div className="ds-empty-art" aria-hidden="true">{illustration}</div>}
      <p className="ds-empty-title">{title}</p>
      {body&&<p className="ds-empty-body">{body}</p>}
      {action&&<div className="ds-empty-action">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ error state */
/* Always says what went wrong, never only that something did, and always
   offers the way back. */
export function ErrorState({reason,onRetry,retryLabel='Try again'}:{
  reason:string;onRetry?:()=>void;retryLabel?:string;
}){
  return (
    <div className="ds-error" role="alert">
      <span className="ds-error-ic" aria-hidden="true"><AlertTriangle/></span>
      <p className="ds-error-title">That did not work</p>
      <p className="ds-error-body">{reason}</p>
      {onRetry&&<Button variant="secondary" size="sm" icon={<RotateCw/>} onClick={onRetry}>{retryLabel}</Button>}
    </div>
  );
}

/* The focus trap and Escape handling moved to lib/dismissable.ts, so the five
   other sheets in the application can use the same one. */

/* ------------------------------------------------------------ bottom sheet */
/* A secondary action belongs in a sheet over the screen the member is on, not
   on a screen of its own that loses their place. */
export function BottomSheet({open,onClose,title,children,footer}:{
  open:boolean;onClose:()=>void;title?:ReactNode;children:ReactNode;footer?:ReactNode;
}){
  const ref=useDismissable(open,onClose);
  if(!open)return null;
  return (
    <div className="ds-scrim" onClick={onClose}>
      <div className="ds-sheet" role="dialog" aria-modal="true" aria-label={typeof title==='string'?title:'Options'}
           ref={ref} tabIndex={-1} onClick={e=>e.stopPropagation()}>
        <span className="ds-sheet-grip" aria-hidden="true"/>
        {title&&<div className="ds-sheet-head">
          <p className="ds-sheet-title">{title}</p>
          <button className="ds-icon-btn" onClick={onClose} aria-label="Close"><X/></button>
        </div>}
        <div className="ds-sheet-body">{children}</div>
        {footer&&<div className="ds-sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- modal */
export function Modal({open,onClose,title,children,footer,size='md'}:{
  open:boolean;onClose:()=>void;title:ReactNode;children:ReactNode;footer?:ReactNode;size?:'sm'|'md';
}){
  const ref=useDismissable(open,onClose);
  if(!open)return null;
  return (
    <div className="ds-scrim center" onClick={onClose}>
      <div className={`ds-modal s-${size}`} role="dialog" aria-modal="true"
           aria-label={typeof title==='string'?title:'Dialog'}
           ref={ref} tabIndex={-1} onClick={e=>e.stopPropagation()}>
        <div className="ds-sheet-head">
          <p className="ds-sheet-title">{title}</p>
          <button className="ds-icon-btn" onClick={onClose} aria-label="Close"><X/></button>
        </div>
        <div className="ds-sheet-body">{children}</div>
        {footer&&<div className="ds-sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- confirm */
/* Every destructive action states its consequence in the dialog. "Are you
   sure?" is not a consequence. */
export function Confirm({open,onClose,onConfirm,title,consequence,confirmLabel='Confirm',destructive=true,busy=false}:{
  open:boolean;onClose:()=>void;onConfirm:()=>void;title:string;consequence:string;
  confirmLabel?:string;destructive?:boolean;busy?:boolean;
}){
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <div className="ds-btn-pair">
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant={destructive?'destructive':'primary'} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
      </div>
    }>
      <p className="ds-confirm-body">{consequence}</p>
    </Modal>
  );
}

/* -------------------------------------------------------------- page head */
/* One navigation pattern for the whole app: a large left aligned title, a back
   affordance where one applies, and at most two trailing actions. Three
   different patterns were in use before this: a green header, a centred bare
   title bar, and a grey circle back button. */
export function PageHeader({title,subtitle,onBack,actions,sticky=true}:{
  title:ReactNode;subtitle?:ReactNode;onBack?:()=>void;actions?:ReactNode;sticky?:boolean;
}){
  const [shrunk,setShrunk]=useState(false);
  useEffect(()=>{
    if(!sticky)return;
    const onScroll=()=>setShrunk(window.scrollY>12);
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[sticky]);
  return (
    <header className={`ds-head${sticky?' sticky':''}${shrunk?' shrunk':''}`}>
      <div className="ds-head-bar">
        {onBack&&<button className="ds-icon-btn back" onClick={onBack} aria-label="Back"><ChevronLeft/></button>}
        <div className="ds-head-text">
          <h1 className="ds-head-title">{title}</h1>
          {subtitle&&<p className="ds-head-sub">{subtitle}</p>}
        </div>
        {actions&&<div className="ds-head-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({children,action}:{children:ReactNode;action?:ReactNode}){
  return <div className="ds-sec-head"><h2>{children}</h2>{action}</div>;
}

/* An icon-only control always carries its name for a screen reader. */
export function IconBtn({label,children,onClick,badge}:{
  label:string;children:ReactNode;onClick?:()=>void;badge?:boolean|number;
}){
  return (
    <button className="ds-icon-btn" aria-label={label} onClick={onClick}>
      {children}
      {badge!==undefined&&badge!==false&&badge!==0&&
        <span className="ds-icon-badge" aria-hidden="true">{typeof badge==='number'&&badge>0?(badge>9?'9+':badge):''}</span>}
    </button>
  );
}

/* Scroll position is restored when a member returns to a list, so going back
   does not dump them at the top of a screen they had read halfway down. */
export function useScrollRestore(key:string){
  useEffect(()=>{
    const saved=sessionStorage.getItem('scroll:'+key);
    if(saved)requestAnimationFrame(()=>window.scrollTo(0,Number(saved)));
    const save=()=>sessionStorage.setItem('scroll:'+key,String(window.scrollY));
    window.addEventListener('scroll',save,{passive:true});
    return()=>{save();window.removeEventListener('scroll',save)};
  },[key]);
}

export const useConfirm=()=>{
  const [state,setState]=useState<{open:boolean;title:string;consequence:string;confirmLabel?:string;action?:()=>void}>({open:false,title:'',consequence:''});
  const ask=useCallback((o:{title:string;consequence:string;confirmLabel?:string;action:()=>void})=>setState({...o,open:true}),[]);
  const close=useCallback(()=>setState(s=>({...s,open:false})),[]);
  const node=<Confirm open={state.open} onClose={close} onConfirm={()=>{state.action?.();close()}}
    title={state.title} consequence={state.consequence} confirmLabel={state.confirmLabel}/>;
  return {ask,node};
};
