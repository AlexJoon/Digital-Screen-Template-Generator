import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SlideRender from './components/SlideRender.jsx'
import './index.css'

// Simple routing based on URL path
const pathname = window.location.pathname

const getComponent = () => {
  if (pathname === '/render') {
    return <SlideRender />
  }
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {getComponent()}
  </React.StrictMode>,
)
