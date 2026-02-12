"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PrivacyModal from "./PrivacyModal";

export default function Footer() {
    const t = useTranslations('Footer');
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    return (
        <>
            <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

            <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 mt-12">
                <div className="flex flex-col items-center gap-2">
                    <p>{t('copyright')}</p>
                    <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-gray-400 hover:text-brand-green transition-colors text-xs underline decoration-dotted underline-offset-4"
                    >
                        {t('privacyLink')}
                    </button>
                </div>
            </footer>
        </>
    );
}
