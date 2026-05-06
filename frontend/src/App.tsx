import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Shell from './components/layout/Shell'
import Explorer from './views/Explorer'
import Dashboard from './views/Dashboard'
import Connect from './views/Connect'
import './index.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/explore" element={<Explorer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/connect" element={<Connect />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </QueryClientProvider>
  )
}