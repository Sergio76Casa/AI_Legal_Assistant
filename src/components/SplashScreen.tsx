import { useEffect, useState } from 'react';

interface SplashScreenProps {
    onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onFinish, 500); // wait for fade-out animation
        }, 1800);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-[200] bg-black flex items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {/* Background pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-primary/5 animate-ping" style={{ animationDuration: '2s' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
            </div>

            {/* Logo */}
            <div className="relative flex flex-col items-center gap-6">
                <div className="pulse-glow">
                    <img
                        src="/logo.svg"
                        alt="LegalFlow"
                        className="w-20 h-20"
                    />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="font-serif text-3xl font-bold text-white tracking-tight">
                        LegalFlow
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Preparando tu espacio
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
