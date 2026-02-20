import { useState } from 'react';

import { BookDemoModal } from './BookDemoModal';
import { LegalModal } from './Landing/LegalModal';
import { Navbar } from './Landing/Navbar';
import { Hero } from './Landing/Hero';
import { TrustBar } from './Landing/TrustBar';
import { Features } from './Landing/Features';
import { Pricing } from './Landing/Pricing';
import { Partners } from './Landing/Partners';
import { CTASection } from './Landing/CTASection';
import { Footer } from './Landing/Footer';

interface LandingPageProps {
    onLogin: () => void;
    onCreateOrg: () => void;
}

export function LandingPage({ onLogin, onCreateOrg }: LandingPageProps) {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [legalModal, setLegalModal] = useState<'privacy' | 'cookies' | null>(null);

    return (
        <div className="min-h-screen bg-[#0a0f1d] font-display text-slate-100 antialiased selection:bg-primary/30 selection:text-primary">
            {/* Navigation */}
            <Navbar onLogin={onLogin} onCreateOrg={onCreateOrg} />

            <main>
                {/* Hero Section */}
                <Hero onCreateOrg={onCreateOrg} onBookDemo={() => setIsDemoModalOpen(true)} />

                {/* Global Social Proof */}
                <TrustBar />

                {/* Bento Feature Grid */}
                <Features />

                {/* Pricing Plans */}
                <Pricing onCreateOrg={onCreateOrg} onBookDemo={() => setIsDemoModalOpen(true)} />

                {/* Dynamic CTA */}
                <CTASection onCreateOrg={onCreateOrg} onBookDemo={() => setIsDemoModalOpen(true)} />

                {/* Partner / Affiliate Program */}
                <Partners />
            </main>

            {/* Modern Footer */}
            <Footer onBookDemo={() => setIsDemoModalOpen(true)} onOpenLegal={setLegalModal} />

            {/* Modals */}
            <BookDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
            <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
        </div>
    );
}
