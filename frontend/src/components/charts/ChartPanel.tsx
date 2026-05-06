import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import type { ChartSuggestion } from '../../stores/dataStore'

interface ChartPanelProps {
  suggestion: ChartSuggestion
  data: { columns: string[]; rows: unknown[][] }
  onPin?: () => void
  pinned?: boolean
}

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16']

export default function ChartPanel({ suggestion, data, onPin, pinned }: ChartPanelProps) {
  const option = useMemo(() => {
    const xi = suggestion.x_column ? data.columns.indexOf(suggestion.x_column) : -1
    const yi = suggestion.y_column ? data.columns.indexOf(suggestion.y_column) : -1
    const xData = data.rows.map(r => r[xi]), yData = data.rows.map(r => r[yi])
    const base = { backgroundColor:'transparent', color:COLORS, tooltip:{trigger:'axis'}, grid:{top:10,right:16,bottom:40,left:50,containLabel:true} }
    if (suggestion.chart_type === 'pie') return { ...base, tooltip:{trigger:'item'}, series:[{type:'pie',radius:['35%','65%'],data:data.rows.map(r=>({name:r[xi],value:r[yi]}))}] }
    if (suggestion.chart_type === 'scatter') return { ...base, xAxis:{type:'value',name:suggestion.x_column}, yAxis:{type:'value',name:suggestion.y_column}, series:[{type:'scatter',data:data.rows.map(r=>[r[xi],r[yi]]),symbolSize:8}] }
    return { ...base, xAxis:{type:'category',data:xData,axisLabel:{rotate:xData.length>10?35:0}}, yAxis:{type:'value',name:suggestion.y_column}, series:[{type:suggestion.chart_type==='line'?'line':'bar',data:yData,smooth:true,barMaxWidth:40}] }
  }, [suggestion, data])

  return (
    <div style={{background:'var(--bg2)',border:'0.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
        <div><h3 style={{fontSize:13,fontWeight:500}}>{suggestion.title}</h3><p style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{suggestion.description}</p></div>
        {onPin && <button onClick={onPin} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:pinned?'#f59e0b':'var(--text2)',padding:0}}>{pinned?'★':'☆'}</button>}
      </div>
      <ReactECharts option={option} style={{height:'280px'}} theme="dark" />
    </div>
  )
}