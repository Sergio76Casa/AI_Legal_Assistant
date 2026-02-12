import { FileText, Heart, MapPin, Scale } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BentoGrid() {
    const t = useTranslations('BentoGrid');

    const services = [
        {
            id: 1,
            title: t('services.legal.title'),
            description: t('services.legal.description'),
            icon: <Scale className="h-6 w-6 text-brand-gold" />,
            colSpan: "col-span-1 md:col-span-2",
            bgClass: "bg-brand-surface",
        },
        {
            id: 2,
            title: t('services.culture.title'),
            description: t('services.culture.description'),
            icon: <Heart className="h-6 w-6 text-rose-500" />,
            colSpan: "col-span-1",
            bgClass: "bg-white",
        },
        {
            id: 3,
            title: t('services.halal.title'),
            description: t('services.halal.description'),
            icon: <MapPin className="h-6 w-6 text-brand-green" />,
            colSpan: "col-span-1",
            bgClass: "bg-white",
        },
        {
            id: 4,
            title: t('services.aid.title'),
            description: t('services.aid.description'),
            icon: <FileText className="h-6 w-6 text-blue-500" />,
            colSpan: "col-span-1 md:col-span-2",
            bgClass: "bg-brand-surface",
        },
    ];

    return (
        <section className="py-20 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className={`relative group overflow-hidden rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${service.colSpan} ${service.bgClass}`}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity">
                            {service.icon}
                        </div>

                        <div className="flex flex-col justify-end h-full">
                            <h3 className="font-serif text-2xl font-semibold text-brand-green mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 font-light text-sm">
                                {service.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
