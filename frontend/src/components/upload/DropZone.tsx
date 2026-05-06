import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useDataStore } from '../../stores/dataStore'

const ACCEPTED = { 'text/csv': ['.csv'], 'application/json': ['.json'], 'application/octet-stream': ['.parquet'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }

export default function DropZone() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setSession = useDataStore((s) => s.setSession)

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]; if (!file) return
    setLoading(true); setError(null)
    try {
      const form = new FormData(); form.append('file', file)
      const { data } = await axios.post('/api/datasets/upload', form)
      setSession(data.session_id, data.filename, data.tables, data.profiles, data.suggestions, data.insights)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Upload failed') }
    finally { setLoading(false) }
  }, [setSession])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, multiple: false, disabled: loading })

  return (
    <div style={{border:'1.5px dashed var(--border2)',borderRadius:'var(--radius-lg)',padding:'3rem 2rem',textAlign:'center',cursor:'pointer',transition:'border-color 0.2s',borderColor:isDragActive?'var(--accent2)':undefined}} {...getRootProps()}>
      <input {...getInputProps()} />
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem',color:'var(--text2)'}}>
        {loading ? <><Loader2 size={32} style={{animation:'spin 1s linear infinite'}} /><p>Profiling data and generating AI suggestions...</p></>
         : <><Upload size={32} strokeWidth={1} /><p style={{fontSize:15,fontWeight:500,color:'var(--text)'}}>{isDragActive ? 'Drop it!' : 'Drop a file here'}</p><p style={{fontSize:12,fontFamily:'var(--mono)'}}>CSV / JSON / Parquet / Excel</p></>}
      </div>
      {error && <div style={{display:'flex',alignItems:'center',gap:6,marginTop:'1rem',color:'var(--danger)',fontSize:12,justifyContent:'center'}}><AlertCircle size={14} /><span>{error}</span></div>}
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}