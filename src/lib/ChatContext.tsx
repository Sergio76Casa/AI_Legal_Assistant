import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    query: string;
    setQuery: (query: string) => void;
    sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const sendMessage = (text: string) => {
        setQuery(text);
        setIsOpen(true);
    };

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, query, setQuery, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
