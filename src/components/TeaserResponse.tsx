import { useTranslations } from "next-intl";

interface TeaserResponseProps {
    content: string;
    onRegister: () => void;
}

export default function TeaserResponse({ content, onRegister }: TeaserResponseProps) {
    const t = useTranslations('ChatDrawer');
    // Show roughly 40% of the content or first 150 chars
    const visibleContent = content.slice(0, 150) + "...";

    return (
        <div className="relative">
            <p className="text-gray-800 leading-relaxed mb-2">
                {visibleContent}
            </p>

            {/* Blur Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-100 to-transparent flex flex-col items-center justify-end pb-2">
                <div className="w-full h-full backdrop-blur-[2px] absolute inset-0" />
                <button
                    onClick={onRegister}
                    className="relative z-10 bg-brand-green text-white px-6 py-2 rounded-full text-sm font-medium shadow-md hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5"
                >
                    {t('teaserButton')}
                </button>
            </div>
        </div>
    );
}
