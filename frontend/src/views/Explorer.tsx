import { useState } from 'react'
import { useDataStore } from '../stores/dataStore'
import DropZone from '../components/upload/DropZone'
import ChartPanel from '../components/charts/ChartPanel'
import axios from 'axios'

export default function Explorer() {
  const { sessionId, activeTable, tables, profiles, suggestions, insights, setActiveTable, pinChart, pinnedCharts } = useDataStore()
  const [nlQuery, setNlQuery] = useState('')
  const [nlLoading, setNlLoading] = useState(false)
  const [nlResult, setNlResult] = useState<{query:string;columns:string[];rows:unknown[][]}|null>(null)
  const [chartData, setChartData] = useState<Record<string,{columns:string[];rows:unknown[][]}>>({})

  const profile = activeTable ? profiles[activeTable] : null
  const tableSuggestions = activeTable ? (suggestions[activeTable]??[]) : []
  const insight = activeTable ? insights[activeTable] : null

  const loadChartData = async (i: number) => {
    if (!sessionId || !activeTable) return
    const s = tableSuggestions[i], key = activeTable+':'+i
    if (chartData[key]) return
    try {
      const { data } = await axios.post('/api/charts/data', { session_id:sessionId, table_name:activeTable, x_column:s.x_column, y_column:s.y_column, color_column:s.color_column, aggregation:s.aggregation })
      setChartData(prev => ({...prev, [key]: data}))
    } catch {}
  }

  const runNlQuery = async () => {
    if (!sessionId || !activeTable || !nlQuery.trim()) return
    setNlLoading(true)
    try { const { data } = await axios.post('/api/ai/query', { session_id:sessionId, table_name:activeTable, question:nlQuery }); setNlResult(data) }
    catch {} finally { setNlLoading(false) }
  }

  if (!sessionId) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:520}}>
        <h1 style={{fontSize:22,fontWeight:500,marginBottom:'0.5rem'}}>Drop in your data</h1>
        <p style={{color:'var(--text2)',marginBottom:'1.5rem'}}>DataLens will profile it and suggest the best visualizations automatically.</p>
        <DropZone />
      </div>
    </div>
  )

  return (
    <div style={{padding:'1.5rem',overflow:'auto'}}>
      {tables.length > 1 && <div style={{display:'flex',gap:4,marginBottom:'1rem'}}>{tables.map(t => <button key={t} className={t===activeTable?'btn-primary':''} onClick={()=>setActiveTable(t)} style={{fontSize:12,fontFamily:'var(--mono)'}}>{t}</button>)}</div>}
      {profile && <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        {insight && <div style={{background:'rgba(37,99,235,0.1)',border:'0.5px solid rgba(59,130,246,0.3)',borderRadius:'var(--radius)',padding:'10px 14px',fontSize:13}}>{insight}</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {[['rows',profile.row_count.toLocaleString()],['columns',profile.column_count],['suggestions',tableSuggestions.length],['pinned',pinnedCharts.length]].map(([l,v])=>(
            <div key={l} style={{background:'var(--bg2)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',padding:12}}>
              <div style={{fontSize:22,fontWeight:500,fontFamily:'var(--mono)'}}>{v}</div>
              <div style={{fontSize:11,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8}}><input value={nlQuery} onChange={e=>setNlQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runNlQuery()} placeholder={"Ask a question about "+activeTable+"... e.g. 'Show total sales by region'"} /><button className="btn-primary" onClick={runNlQuery} disabled={nlLoading}>{nlLoading?'Thinking...':'Ask AI'}</button></div>
        {nlResult && <div style={{background:'var(--bg2)',border:'0.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1rem'}}><p style={{fontSize:11,fontFamily:'var(--mono)',color:'var(--text2)',marginBottom:8}}>Query: {nlResult.query}</p><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'var(--mono)'}}><thead><tr>{nlResult.columns.map(c=><th key={c} style={{textAlign:'left',padding:'6px 10px',color:'var(--text2)',borderBottom:'0.5px solid var(--border)',fontWeight:500}}>{c}</th>)}</tr></thead><tbody>{nlResult.rows.slice(0,50).map((row,i)=><tr key={i}>{(row as unknown[]).map((cell,j)=><td key={j} style={{padding:'5px 10px',borderBottom:'0.5px solid var(--border)'}}>{String(cell)}</td>)}</tr>)}</tbody></table></div></div>}
        <h2 style={{fontSize:13,fontWeight:500,color:'var(--text2)'}}>AI CHART SUGGESTIONS</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))',gap:'1rem'}}>
          {tableSuggestions.map((s,i)=>{const key=activeTable+':'+i;if(!chartData[key])loadChartData(i);return <ChartPanel key={key} suggestion={s} data={chartData[key]??{columns:[],rows:[]}} onPin={()=>pinChart(s)} pinned={pinnedCharts.some(p=>p.title===s.title)} />})}
        </div>
      </div>}
    </div>
  )
}