import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/services/firebase'
export default function Clientes() {
  const [clientes,setClientes]=useState([])
  const [loading,setLoading]=useState(true)
  const [buscar,setBuscar]=useState('')
  const cargar=async()=>{ setLoading(true); const s=await getDocs(collection(db,'usuarios')); setClientes(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) }
  useEffect(()=>{ cargar() },[])
  const toggleActivo=async(id,activo)=>{ await updateDoc(doc(db,'usuarios',id),{activo:!activo}); cargar() }
  const filtrados=clientes.filter(c=>c.nombre?.toLowerCase().includes(buscar.toLowerCase())||c.email?.toLowerCase().includes(buscar.toLowerCase()))
  return (
    <div style={{padding:28}}>
      <h1 style={{fontSize:22,fontWeight:700,color:'#0A2A1E',marginBottom:4}}>Clientes</h1>
      <p style={{fontSize:13,color:'#888',marginBottom:20}}>{clientes.length} registrados</p>
      <input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar..." style={{width:'100%',maxWidth:360,padding:'9px 14px',borderRadius:9,border:'1.5px solid #E5E5E3',fontSize:13,marginBottom:20,boxSizing:'border-box'}}/>
      {loading?<p style={{color:'#888'}}>Cargando...</p>:(
        <div style={{background:'#fff',border:'1px solid #E5E5E3',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'#F8F8F6',borderBottom:'1px solid #E5E5E3'}}>
              {['Nombre','Email','Teléfono','Rol','Estado',''].map(h=><th key={h} style={{padding:'12px 14px',textAlign:'left',color:'#888',fontWeight:600,fontSize:11}}>{h}</th>)}
            </tr></thead>
            <tbody>{filtrados.map(c=>(
              <tr key={c.id} style={{borderBottom:'1px solid #F5F5F5'}}>
                <td style={{padding:'12px 14px',fontWeight:600,color:'#0A2A1E'}}>{c.nombre||'—'}</td>
                <td style={{padding:'12px 14px',color:'#555'}}>{c.email}</td>
                <td style={{padding:'12px 14px',color:'#555'}}>{c.telefono||'—'}</td>
                <td style={{padding:'12px 14px'}}><span style={{background:c.rol==='admin'?'#0A2A1E':'#E1F5EE',color:c.rol==='admin'?'#9FE1CB':'#085041',fontSize:11,padding:'2px 8px',borderRadius:20,fontWeight:600}}>{c.rol||'cliente'}</span></td>
                <td style={{padding:'12px 14px'}}>{c.activo?'✅':'⛔'}</td>
                <td style={{padding:'12px 14px'}}><button onClick={()=>toggleActivo(c.id,c.activo)} style={{background:c.activo?'#FCEBEB':'#E1F5EE',color:c.activo?'#A32D2D':'#085041',border:'none',padding:'5px 12px',borderRadius:7,fontSize:11,fontWeight:600,cursor:'pointer'}}>{c.activo?'Desactivar':'Activar'}</button></td>
              </tr>
            ))}</tbody>
          </table>
          {filtrados.length===0&&<p style={{padding:24,color:'#888',textAlign:'center'}}>Sin clientes.</p>}
        </div>
      )}
    </div>
  )
}
