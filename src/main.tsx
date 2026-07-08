import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { ThemeProvider } from "@/providers/theme-provider"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <ThemeProvider defaultTheme="system" storageKey="skillswap-theme">
          <App />
        </ThemeProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
