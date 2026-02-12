import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import ChatDrawer from "@/components/ChatDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Footer from "@/components/Footer";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('Footer');

  return (
    <main className="min-h-screen bg-brand-white selection:bg-brand-green/20 selection:text-brand-green">
      <LanguageSwitcher />
      <Hero />
      <BentoGrid />
      <ChatDrawer />

      {/* Footer Simple */}
      <Footer />
    </main>
  );
}
