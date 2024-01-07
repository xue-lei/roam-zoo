import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import 'uno.css'
import 'virtual:unocss-devtools'
import App from './App'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
