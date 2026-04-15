import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n'
import { AppSettingsProvider } from './lib/AppSettingsContext'
import { TenantProvider } from './lib/TenantContext'
import { ChatProvider } from './lib/ChatContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppSettingsProvider>
            <TenantProvider>
                <ChatProvider>
                    <App />
                </ChatProvider>
            </TenantProvider>
        </AppSettingsProvider>
    </React.StrictMode>,
)
