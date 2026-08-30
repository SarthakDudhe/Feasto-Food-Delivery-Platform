import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RiderProvider } from './context/RiderContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RiderProvider>
        <App />
      </RiderProvider>
    </BrowserRouter>
  </StrictMode>,
)
