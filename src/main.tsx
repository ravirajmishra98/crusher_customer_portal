import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { getPortalTitle } from '@/config/env'
import './index.css'

document.title = getPortalTitle()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
