import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'
const EMPTY = { nombre:'',destino:'',pais:'',duracionDias:'',precioPorPersona:'',cupoMaximo:'',incluye:'',estado:'disponible',activo:true }
export default function Paquetes() {
  const [paquetes,setPaquetes]=useState([])
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState(EMPTY)
  const [editId,setEditId]=useState(null)
  const [saving,setSaving]=useState(false)
  const cargar=async()=>{ setLoading(true); const s=await getDocs(collection(db,'paquetes')); setPaquetes(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) }
  useEffect(()=>{ cargar() },[])
  const abrirNuevo=()=>{ setForm(EMPTY); setEditId(null); setModal(true) }
  const abrirEditar=(p)=>{ setForm({...p,incluye:Array.isArray(p.incluye)?p.incluye.join(', '):p.incluye||''}); setEditId(p.id); setModal(true) }
  const guardar=async(e)=>{ e.preventDefault(); setSaving(true)
    const data={...form,duracionDias:Number(form.duracionDias),precioPorPersona:Number(form.precioPorPersona),cupoMaximo:Number(form.cupoMaximo),cuposDisponibles:Number(form.cupoMaximo),incluye:form.incluye.split(',').map(s=>s.trim()).filter(Boolean)}
    if(editId) await updateDoc(doc(db,'paquetes',editId),{...data,actualizadoEn:serverTimestamp()})
    else await addDoc(collection(db,'paquetes'),{...data,creadoEn:serverTimestamp()})
    setModal(false); setSaving(false); cargar()
  }
  const toggleActivo=async(p)=>{ await updateDoc(doc(db,'paquetes',p.id),{activo:!p.activo}); cargar() }
  const badge=(e)=>{ const m={disponible:['#E1F5EE','#085041'],pocas_plazas:['#FAEEDA','#633806'],agotado:['#FCEBEB','#A32D2D']}; const [bg,color]=m[e]||['#f0f0f0','#555']; return <span style={{background:bg,color,fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:600}}>{e}</span> }
  return (
    <div style={{padding:28}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:'#0A2A1E'}}>Paquetes</h1><p style={{fontSize:13,color:'#888'}}>{paquetes.length} registrados</p></div>
        <button onClick={abrirNuevo} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'10px 20px',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nuevo</button>
      </div>
      {loading?<p style={{color:'#888'}}>Cargando...</p>:(
        <div style={{background:'#fff',border:'1px solid #E5E5E3',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#F8F8F6',borderBottom:'1px solid #E5E5E3'}}>
              {['Nombre','Destino','Días','Precio','Cupos','Estado','Activo',''].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',color:'#888',fontWeight:600,fontSize:11}}>{h}</th>)}
            </tr></thead>
            <tbody>{paquetes.map(p=>(
              <tr key={p.id} style={{borderBottom:'1px solid #F5F5F5'}}>
                <td style={{padding:'12px 14px',fontWeight:600,color:'#0A2A1E'}}>{p.nombre}</td>
                <td style={{padding:'12px 14px',color:'#555'}}>{p.destino}, {p.pais}</td>
                <td style={{padding:'12px 14px'}}>{p.duracionDias}D</td>
                <td style={{padding:'12px 14px',fontWeight:600,color:'#1D9E75'}}>${(p.precioPorPersona||0).toLocaleString()}</td>
                <td style={{padding:'12px 14px'}}>{p.cuposDisponibles}/{p.cupoMaximo}</td>
                <td style={{padding:'12px 14px'}}>{badge(p.estado)}</td>
                <td style={{padding:'12px 14px'}}><span onClick={()=>toggleActivo(p)} style={{cursor:'pointer',fontSize:18}}>{p.activo?'✅':'⛔'}</span></td>
                <td style={{padding:'12px 14px'}}><button onClick={()=>abrirEditar(p)} style={{background:'#E1F5EE',color:'#0F6E56',border:'none',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer'}}>Editar</button></td>
              </tr>
            ))}</tbody>
          </table>
          {paquetes.length===0&&<p style={{padding:24,color:'#888',textAlign:'center'}}>Sin paquetes.</p>}
        </div>
      )}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20}}>
          <div style={{background:'#fff',borderRadius:14,padding:28,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontSize:17,fontWeight:700,color:'#0A2A1E',marginBottom:20}}>{editId?'Editar':'Nuevo'} paquete</h2>
            <form onSubmit={guardar} style={{display:'flex',flexDirection:'column',gap:12}}>
              {[{l:'Nombre',k:'nombre',t:'text'},{l:'Destino',k:'destino',t:'text'},{l:'País',k:'pais',t:'text'},{l:'Días',k:'duracionDias',t:'number'},{l:'Precio ($)',k:'precioPorPersona',t:'number'},{l:'Cupo máximo',k:'cupoMaximo',t:'number'}].map(({l,k,t})=>(
                <div key={k}><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>{l}</label>
                <input type={t} required value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>Estado</label>
                <select value={form.estado} onChange={e=>setForm(p=>({...p,estado:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13}}>
                  <option value="disponible">Disponible</option><option value="pocas_plazas">Pocas plazas</option><option value="agotado">Agotado</option>
                </select></div>
              <div><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>Incluye (separado por comas)</label>
                <textarea value={form.incluye} onChange={e=>setForm(p=>({...p,incluye:e.target.value}))} style={{width:'100%',padding:'9px 11px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13,height:70,resize:'none',boxSizing:'border-box'}}/></div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button type="button" onClick={()=>setModal(false)} style={{flex:1,padding:11,borderRadius:9,border:'1.5px solid #E5E5E3',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
                <button type="submit" disabled={saving} style={{flex:1,padding:11,borderRadius:9,border:'none',background:'#1D9E75',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>{saving?'Guardando...':'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
