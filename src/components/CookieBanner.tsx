"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PrivacyModal from "./PrivacyModal";

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const t = useTranslations("Legal"); // Assuming 'Legal' namespace exists or use fallback

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "true");
        setShowBanner(false);
    };

    if (!showBanner && !showPrivacyModal) return null;

    return (
        <>
            <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

            {showBanner && (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 flex flex-col md:flex-row justify-between items-center shadow-lg border-t border-gray-700">
                    <div className="mb-4 md:mb-0 text-sm text-gray-300 max-w-2xl">
                        <p>
                            {t('cookieBanner')}{" "}
                            {t('readPolicy')} <button onClick={() => setShowPrivacyModal(true)} className="underline hover:text-white">{t('privacyButton')}</button>.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowBanner(false)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {t('decline')}
                        </button>
                        <button
                            onClick={acceptCookies}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            {t('accept')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
