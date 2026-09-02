import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, orderBy, query } from 'firebase/firestore'
import { db } from '@/services/firebase'
export default function Notificaciones() {
  const [notifs,setNotifs]=useState([])
  const [usuarios,setUsuarios]=useState([])
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState({usuarioId:'',tipo:'confirmacion',canal:'email',asunto:'',mensaje:''})
  const [saving,setSaving]=useState(false)
  const [ok,setOk]=useState(false)
  const cargar=async()=>{ setLoading(true); try{ const [nSnap,uSnap]=await Promise.all([getDocs(query(collection(db,'notificaciones'),orderBy('programadaEn','desc'))),getDocs(collection(db,'usuarios'))]); setNotifs(nSnap.docs.map(d=>({id:d.id,...d.data()}))); setUsuarios(uSnap.docs.map(d=>({id:d.id,...d.data()}))) }catch(e){} setLoading(false) }
  useEffect(()=>{ cargar() },[])
  const enviar=async(e)=>{ e.preventDefault(); setSaving(true); await addDoc(collection(db,'notificaciones'),{...form,estado:'enviada',programadaEn:new Date(),enviadaEn:new Date()}); setForm({usuarioId:'',tipo:'confirmacion',canal:'email',asunto:'',mensaje:''}); setOk(true); setTimeout(()=>setOk(false),3000); setSaving(false); cargar() }
  const badge=(c)=>{ const m={email:['#E1F5EE','#085041','✉️'],whatsapp:['#E8F5E9','#075E54','💬']}; const [bg,color,icon]=m[c]||['#f0f0f0','#555','🔔']; return <span style={{background:bg,color,fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:600}}>{icon} {c}</span> }
  return (
    <div style={{padding:28}}>
      <h1 style={{fontSize:22,fontWeight:700,color:'#0A2A1E',marginBottom:4}}>Notificaciones</h1>
      <p style={{fontSize:13,color:'#888',marginBottom:24}}>Envío manual a clientes</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:20}}>
        <div style={{background:'#fff',border:'1px solid #E5E5E3',borderRadius:12,padding:20}}>
          <h2 style={{fontSize:15,fontWeight:700,color:'#0A2A1E',marginBottom:16}}>Nueva notificación</h2>
          {ok&&<div style={{background:'#E1F5EE',color:'#0F6E56',padding:'10px 12px',borderRadius:8,fontSize:13,fontWeight:600,marginBottom:14}}>✅ Registrada</div>}
          <form onSubmit={enviar} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>Cliente</label>
              <select required value={form.usuarioId} onChange={e=>setForm(p=>({...p,usuarioId:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13}}>
                <option value="">Seleccionar...</option>
                {usuarios.map(u=><option key={u.id} value={u.id}>{u.nombre||u.email}</option>)}
              </select></div>
            <div><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>Canal</label>
              <select value={form.canal} onChange={e=>setForm(p=>({...p,canal:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13}}>
                <option value="email">Email</option><option value="whatsapp">WhatsApp</option>
              </select></div>
            <div><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>Asunto</label>
              <input required value={form.asunto} onChange={e=>setForm(p=>({...p,asunto:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13,boxSizing:'border-box'}}/></div>
            <div><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>Mensaje</label>
              <textarea required value={form.mensaje} onChange={e=>setForm(p=>({...p,mensaje:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13,height:100,resize:'none',boxSizing:'border-box'}}/></div>
            <button type="submit" disabled={saving} style={{background:'#1D9E75',color:'#fff',border:'none',padding:11,borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'}}>{saving?'Enviando...':'Registrar'}</button>
          </form>
        </div>
        <div style={{background:'#fff',border:'1px solid #E5E5E3',borderRadius:12,padding:20}}>
          <h2 style={{fontSize:15,fontWeight:700,color:'#0A2A1E',marginBottom:16}}>Historial</h2>
          {loading?<p style={{color:'#888'}}>Cargando...</p>:notifs.length===0?<p style={{color:'#888'}}>Sin notificaciones.</p>:notifs.map(n=>(
            <div key={n.id} style={{padding:'10px 0',borderBottom:'1px solid #F5F5F5'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontWeight:600,color:'#0A2A1E',fontSize:13}}>{n.asunto}</span>{badge(n.canal)}</div>
              <div style={{fontSize:12,color:'#888'}}>{n.mensaje?.slice(0,80)}...</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
