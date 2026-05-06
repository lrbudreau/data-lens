import { create } from 'zustand'

export interface ColumnProfile {
  name: string; dtype: string; semantic_type: string; nullable: boolean
  null_pct: number; unique_count: number; cardinality: string
  sample_values: unknown[]; min_value: number|null; max_value: number|null; mean_value: number|null
}
export interface TableProfile { name: string; row_count: number; column_count: number; columns: ColumnProfile[] }
export interface ChartSuggestion {
  chart_type: string; title: string; description: string
  x_column: string|null; y_column: string|null; color_column: string|null
  aggregation: string|null; confidence: number
}

interface DataState {
  sessionId: string|null; datasetName: string|null; tables: string[]; activeTable: string|null
  profiles: Record<string,TableProfile>; suggestions: Record<string,ChartSuggestion[]>
  insights: Record<string,string>; pinnedCharts: ChartSuggestion[]
  setSession: (sid: string, name: string, tables: string[], profiles: Record<string,TableProfile>, suggestions: Record<string,ChartSuggestion[]>, insights: Record<string,string>) => void
  setActiveTable: (t: string) => void
  pinChart: (c: ChartSuggestion) => void
  unpinChart: (i: number) => void
  reset: () => void
}

export const useDataStore = create<DataState>((set) => ({
  sessionId: null, datasetName: null, tables: [], activeTable: null,
  profiles: {}, suggestions: {}, insights: {}, pinnedCharts: [],
  setSession: (sessionId, datasetName, tables, profiles, suggestions, insights) =>
    set({ sessionId, datasetName, tables, activeTable: tables[0]??null, profiles, suggestions, insights }),
  setActiveTable: (activeTable) => set({ activeTable }),
  pinChart: (chart) => set((s) => ({ pinnedCharts: [...s.pinnedCharts, chart] })),
  unpinChart: (index) => set((s) => ({ pinnedCharts: s.pinnedCharts.filter((_,i) => i !== index) })),
  reset: () => set({ sessionId: null, datasetName: null, tables: [], activeTable: null, profiles: {}, suggestions: {}, insights: {}, pinnedCharts: [] }),
}))