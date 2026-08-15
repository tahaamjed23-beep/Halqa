import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Eye, Globe, MessageCircle, Phone, Plus, Search, Send, Users } from 'lucide-react';
import { api, money } from '../api';
import type { Committee, User } from '../types';
import { CommitteeCard, cached, keep } from './HomePage';
import { formatDuration } from '../components/ui';

type Discover={id:string;name:string;hostName:string;hostScore:number;memberCap:number;members:number;
  contributionPaisa:string;periodDays:number;status:string;listedPublicly:boolean;earlyFeeBps:number;
  openSlots:number[];cleanStreak:number;startsAt:string;riskBand:string};

export default function CirclesPage({user,openCommittee,create}:{user:User;openCommittee:(id:string)=>void;create:()=>void}){
  const [tab,setTab]=useState<'mine'|'discover'>('mine');
  const [mine,setMine]=useState<Committee[]>(()=>cached('home.committees',[]));
  const [rows,setRows]=useState<Discover[]>([]);
  const [code,setCode]=useState('');
  const [q,setQ]=useState('');
  const [publicOnly,setPublicOnly]=useState(true);
  const [invite,setInvite]=useState(false);
  const [copied,setCopied]=useState(false);
  const [busy,setBusy]=useState('');

  useEffect(()=>{void api<Committee[]>('/committees?scope=mine').then(list=>{
    const own=list.filter(r=>r.members?.some(m=>m.userId===user.id)||r.hostId===user.id);
    setMine(own);keep('home.committees',own);
  }).catch(()=>{})},[user.id]);
  useEffect(()=>{void api<Discover[]>('/committees/discover').then(r=>setRows(Array.isArray(r)?r:[])).catch(()=>setRows([]))},[]);

  const shown=useMemo(()=>rows
    .filter(r=>!publicOnly||r.listedPublicly)
    .filter(r=>!q||r.name.toLowerCase().includes(q.toLowerCase())),[rows,publicOnly,q]);

  const link=`https://halqa-seven.vercel.app/join/${mine[0]?.inviteCode||'HALQA'}`;
  const text=`Assalam o alaikum. Join my committee on Halqa. Every installment is recorded and you get a receipt for each one. ${link}`;

  const share=async(via:string)=>{
    const enc=encodeURIComponent(text);
    if(via==='whatsapp')window.open(`https://wa.me/?text=${enc}`,'_blank');
    if(via==='sms')window.location.href=`sms:?&body=${enc}`;
    if(via==='skype')window.open(`https://web.skype.com/share?url=${encodeURIComponent(link)}&text=${enc}`,'_blank');
    if(via==='contacts'){
      const nav=navigator as Navigator&{contacts?:{select:(p:string[],o:{multiple:boolean})=>Promise<{tel?:string[];name?:string[]}[]>}};
      if(nav.contacts?.select){
        try{
          const picked=await nav.contacts.select(['name','tel'],{multiple:true});
          const numbers=picked.flatMap(c=>c.tel||[]).filter(Boolean);
          if(numbers.length)window.location.href=`sms:${numbers.join(',')}?&body=${enc}`;
        }catch{/* cancelled */}
      }else if(navigator.share){await navigator.share({text,url:link}).catch(()=>{})}
      else{await navigator.clipboard.writeText(text);setCopied(true)}
    }
    if(via==='copy'){await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000)}
  };

  const join=async(id:string)=>{
    setBusy(id);
    try{await api(`/committees/${id}/join`,{method:'POST',body:JSON.stringify({})});openCommittee(id)}
    catch(e){alert(e instanceof Error?e.message:'Could not join')}
    finally{setBusy('')}
  };

  return <div className="enter">
    <div className="topbar">
      <h1>Committees</h1>
      <button className="btn sm" onClick={create}><Plus/>New</button>
    </div>

    <div style={{padding:'12px 14px 0'}}>
      <div className="seg">
        <button className={tab==='mine'?'on':''} onClick={()=>setTab('mine')}>Mine</button>
        <button className={tab==='discover'?'on':''} onClick={()=>setTab('discover')}>Discover</button>
      </div>
    </div>

    {tab==='mine'?<>
      <div className="sec">
        {mine.length?mine.map((c,i)=><CommitteeCard key={c.id} c={c} userId={user.id} i={i} open={openCommittee}/>):
          <div className="card"><div className="empty" style={{padding:'22px 10px'}}>
            <div className="empty-ic"><Users/></div>
            <strong>No committees yet</strong>
            <p>Start one with people you know, or find an open circle in Discover.</p>
            <div className="btn-pair" style={{marginTop:16}}>
              <button className="btn" onClick={create}>Start one</button>
              <button className="btn ghost" onClick={()=>setTab('discover')}>Discover</button>
            </div>
          </div></div>}
      </div>

      <div className="sec">
        <div className="sec-head"><h2>Have an invite code?</h2></div>
        <div className="card">
          <div style={{display:'flex',gap:9}}>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ABCD12" style={{flex:1,textTransform:'uppercase',letterSpacing:'.12em',fontWeight:640}}/>
            <button className="btn" style={{width:'auto',padding:'0 20px'}} disabled={code.length<4} onClick={()=>void api(`/committees/join/${code}`,{method:'POST'}).then(()=>location.reload()).catch(e=>alert(e.message))}>Join</button>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head"><h2>Invite people</h2></div>
        {!invite?<button className="btn ghost" onClick={()=>setInvite(true)}><Send/>Invite to a committee</button>:
        <div className="card">
          <p style={{fontSize:12.5,color:'var(--muted)',marginBottom:12,lineHeight:1.5}}>Send the invite however they actually talk to you.</p>
          <div className="share-grid">
            <button className="share" onClick={()=>void share('whatsapp')}>
              <span className="share-ic" style={{background:'linear-gradient(135deg,#1FAF38,#60D669)'}}><MessageCircle/></span>
              <span>WhatsApp</span>
            </button>
            <button className="share" onClick={()=>void share('contacts')}>
              <span className="share-ic" style={{background:'linear-gradient(135deg,#41801A,#6DC72A)'}}><Users/></span>
              <span>Contacts</span>
            </button>
            <button className="share" onClick={()=>void share('sms')}>
              <span className="share-ic" style={{background:'linear-gradient(135deg,#1E7BE5,#5AA9F5)'}}><Phone/></span>
              <span>Messages</span>
            </button>
            <button className="share" onClick={()=>void share('skype')}>
              <span className="share-ic" style={{background:'linear-gradient(135deg,#0078D4,#43A5F0)'}}><Send/></span>
              <span>Skype</span>
            </button>
          </div>
          <button className="btn soft" style={{marginTop:12}} onClick={()=>void share('copy')}>
            {copied?<><Check/>Copied</>:<><Copy/>Copy invite link</>}
          </button>
        </div>}
      </div>
    </>:<>
      <div style={{padding:'12px 14px 0'}}>
        <div style={{position:'relative'}}>
          <Search style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:17,height:17,color:'var(--faint)'}}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search circles" style={{paddingLeft:40,height:46}}/>
        </div>

        <div className="card" style={{marginTop:12,padding:'13px 14px'}}>
          <label className="sw-row">
            <span className="sw-lab">
              <Globe style={{width:16,height:16,color:'var(--l600)'}}/>
              <b>Public circles only</b>
            </span>
            <span className={`sw ${publicOnly?'on':''}`} onClick={()=>setPublicOnly(!publicOnly)} role="switch" aria-checked={publicOnly}><i/></span>
          </label>
        </div>

        {publicOnly&&<div className="banner info" style={{margin:'10px 0 0'}}>
          <Eye/><div><b>These circles are public</b>
          <p>Anyone on Halqa can see this listing, its contribution and how many places are left. If you join, your name, area and Sakh become visible to the other members of that circle.</p></div>
        </div>}
      </div>

      <div className="sec">
        {shown.length?shown.map(r=><DiscoverCard key={r.id} r={r} busy={busy===r.id} join={()=>void join(r.id)}/>):
          <div className="card"><div className="empty" style={{padding:'22px 10px'}}>
            <div className="empty-ic"><Globe/></div>
            <strong>Nothing open right now</strong>
            <p>No public circle currently has a place you are eligible for. New ones open every week.</p>
          </div></div>}
      </div>
    </>}
    <div style={{height:16}}/>
  </div>;
}

function DiscoverCard({r,busy,join}:{r:Discover;busy:boolean;join:()=>void}){
  const left=r.memberCap-r.members;
  const initials=r.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return <div className="cm-card" style={{cursor:'default'}}>
    <div className="cm-top">
      <div className="cm-badge">{initials}</div>
      <div className="cm-t">
        <h3>{r.name}</h3>
        <p>{r.hostName} · Sakh {r.hostScore}</p>
      </div>
      {r.listedPublicly&&<span className="chip"><Globe/>Public</span>}
    </div>
    <div className="cm-grid">
      <div><span>Installment</span><strong>{money(r.contributionPaisa)}</strong></div>
      <div><span>Places left</span><strong>{left>0?left:'Full'}</strong></div>
      <div><span>Starts</span><strong>{formatDuration(r.startsAt)}</strong></div>
    </div>
    {r.cleanStreak>0&&<div className="cm-due"><Check/><span>{r.cleanStreak} clean rounds so far</span></div>}
    <button className="btn" style={{marginTop:12}} disabled={busy||left<=0} onClick={join}>
      {busy?'Joining':left>0?<>Join this circle<ArrowRight/></>:'Full'}
    </button>
  </div>;
}
