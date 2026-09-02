import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '@/services/firebase'
export default function Pagos() {
  const [pagos,setPagos]=useState([])
  const [loading,setLoading]=useState(true)
  const [filtro,setFiltro]=useState('todos')
  const cargar=async()=>{ setLoading(true); try{ const s=await getDocs(collection(db,'pagos')); setPagos(s.docs.map(d=>({id:d.id,...d.data()}))) }catch(e){} setLoading(false) }
  useEffect(()=>{ cargar() },[])
  const aprobar=async(id)=>{ await updateDoc(doc(db,'pagos',id),{estado:'aprobado',aprobadoEn:new Date()}); cargar() }
  const rechazar=async(id)=>{ await updateDoc(doc(db,'pagos',id),{estado:'rechazado'}); cargar() }
  const badge=(e)=>{ const m={aprobado:['#E1F5EE','#085041'],pendiente:['#FAEEDA','#633806'],rechazado:['#FCEBEB','#A32D2D']}; const [bg,color]=m[e]||['#f0f0f0','#555']; return <span style={{background:bg,color,fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:600}}>{e}</span> }
  const filtrados=filtro==='todos'?pagos:pagos.filter(p=>p.estado===filtro)
  return (
    <div style={{padding:28}}>
      <h1 style={{fontSize:22,fontWeight:700,color:'#0A2A1E',marginBottom:4}}>Pagos</h1>
      <p style={{fontSize:13,color:'#888',marginBottom:20}}>{pagos.filter(p=>p.estado==='pendiente').length} pendientes</p>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['todos','pendiente','aprobado','rechazado'].map(f=>(
          <button key={f} onClick={()=>setFiltro(f)} style={{padding:'6px 16px',borderRadius:20,border:'1.5px solid',fontSize:12,fontWeight:600,cursor:'pointer',background:filtro===f?'#0A2A1E':'#fff',color:filtro===f?'#9FE1CB':'#555',borderColor:filtro===f?'#0A2A1E':'#E5E5E3'}}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      {loading?<p style={{color:'#888'}}>Cargando...</p>:(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtrados.length===0&&<p style={{color:'#888',textAlign:'center',padding:40}}>Sin pagos.</p>}
          {filtrados.map(p=>(
            <div key={p.id} style={{background:'#fff',border:'1px solid #E5E5E3',borderRadius:12,padding:18,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div style={{display:'flex',gap:14,alignItems:'center'}}>
                <div style={{width:44,height:44,background:'#E1F5EE',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🧾</div>
                <div>
                  <div style={{fontWeight:700,color:'#0A2A1E',fontSize:14}}>${(p.monto||0).toLocaleString()}</div>
                  <div style={{fontSize:12,color:'#888'}}>{p.bancoOrigen||'—'} · {p.numBoleta||'—'}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                {badge(p.estado)}
                {p.urlComprobante&&<a href={p.urlComprobante} target="_blank" rel="noreferrer" style={{background:'#E1F5EE',color:'#0F6E56',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:600,textDecoration:'none'}}>Ver</a>}
                {p.estado==='pendiente'&&<>
                  <button onClick={()=>aprobar(p.id)} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'6px 14px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer'}}>Aprobar</button>
                  <button onClick={()=>rechazar(p.id)} style={{background:'#FCEBEB',color:'#A32D2D',border:'none',padding:'6px 14px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer'}}>Rechazar</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
