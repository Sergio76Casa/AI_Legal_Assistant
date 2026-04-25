import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './lib/i18n'
import { AppSettingsProvider } from './lib/AppSettingsContext'
import { TenantProvider } from './lib/TenantContext'
import { ChatProvider } from './lib/ChatContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppSettingsProvider>
                <TenantProvider>
                    <ChatProvider>
                        <App />
                    </ChatProvider>
                </TenantProvider>
            </AppSettingsProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
