import { useDataStore } from '../stores/dataStore'
import ChartPanel from '../components/charts/ChartPanel'

export default function Dashboard() {
  const { pinnedCharts, unpinChart } = useDataStore()
  if (pinnedCharts.length === 0) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',flexDirection:'column',gap:'0.5rem',color:'var(--text2)'}}>
      <p style={{fontSize:15,color:'var(--text)',fontWeight:500}}>Your dashboard is empty</p>
      <p style={{fontSize:13}}>Pin charts from the Explorer to build your dashboard.</p>
    </div>
  )
  return (
    <div style={{padding:'1.5rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
        <h1 style={{fontSize:16,fontWeight:500}}>Dashboard</h1>
        <span style={{fontSize:12,color:'var(--text2)'}}>{pinnedCharts.length} chart{pinnedCharts.length!==1?'s':''}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))',gap:'1rem'}}>
        {pinnedCharts.map((chart,i)=><ChartPanel key={i} suggestion={chart} data={{columns:[],rows:[]}} onPin={()=>unpinChart(i)} pinned />)}
      </div>
    </div>
  )
}