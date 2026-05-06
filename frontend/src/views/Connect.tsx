import { useState } from 'react'
import { Database, HardDrive } from 'lucide-react'
import axios from 'axios'
import { useDataStore } from '../stores/dataStore'
import { useNavigate } from 'react-router-dom'

export default function Connect() {
  const [dbType, setDbType] = useState<'postgres'|'sqlite'>('postgres')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const navigate = useNavigate()
  const [pg, setPg] = useState({ host:'localhost', port:5432, database:'', username:'', password:'' })
  const [sqlitePath, setSqlitePath] = useState('')

  const connect = async () => {
    setLoading(true); setError(null)
    try {
      let data: { connection_id: string; tables: string[] }
      if (dbType === 'postgres') ({ data } = await axios.post('/api/connections/postgres', pg))
      else ({ data } = await axios.post('/api/connections/sqlite', { db_path: sqlitePath }))
      if (data.tables.length > 0) {
        const { data: pd } = await axios.get('/api/connections/'+data.connection_id+'/profile/'+data.tables[0])
        const profiles: Record<string,typeof pd.profile> = {[data.tables[0]]:pd.profile}
        const suggestions: Record<string,typeof pd.suggestions> = {[data.tables[0]]:pd.suggestions}
        const insights: Record<string,string> = {[data.tables[0]]:pd.insight}
        useDataStore.getState().setSession(data.connection_id, dbType+':'+(pg.database||sqlitePath), data.tables, profiles, suggestions, insights)
        navigate('/explore')
      }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Connection failed') }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:480,margin:'3rem auto',padding:'0 1.5rem'}}>
      <h1 style={{fontSize:18,fontWeight:500,marginBottom:'0.5rem'}}>Connect a database</h1>
      <p style={{color:'var(--text2)',fontSize:13,marginBottom:'1.5rem'}}>Connect to an existing database and explore it with AI-powered visualizations.</p>
      <div style={{display:'flex',gap:8,marginBottom:'1.5rem'}}>
        {(['postgres','sqlite'] as const).map(t=>(
          <button key={t} className={dbType===t?'btn-primary':''} onClick={()=>setDbType(t)} style={{display:'flex',alignItems:'center',gap:6}}>
            {t==='postgres'?<Database size={14}/>:<HardDrive size={14}/>}{t==='postgres'?'PostgreSQL':'SQLite'}
          </button>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {dbType==='postgres'?(
          <>
            {(['host','database','username'] as const).map(f=>(
              <div key={f}><label style={{display:'block',fontSize:11,color:'var(--text2)',marginBottom:4,textTransform:'capitalize'}}>{f}</label><input value={pg[f]} onChange={e=>setPg({...pg,[f]:e.target.value})} placeholder={f==='host'?'localhost':f} /></div>
            ))}
            <div><label style={{display:'block',fontSize:11,color:'var(--text2)',marginBottom:4}}>Password</label><input type="password" value={pg.password} onChange={e=>setPg({...pg,password:e.target.value})} /></div>
          </>
        ):(
          <div><label style={{display:'block',fontSize:11,color:'var(--text2)',marginBottom:4}}>Database file path</label><input value={sqlitePath} onChange={e=>setSqlitePath(e.target.value)} placeholder="/path/to/database.db" /></div>
        )}
      </div>
      {error && <p style={{color:'var(--danger)',fontSize:12,marginTop:12}}>{error}</p>}
      <button className="btn-primary" onClick={connect} disabled={loading} style={{marginTop:'1.25rem',width:'100%'}}>{loading?'Connecting...':'Connect'}</button>
    </div>
  )
}