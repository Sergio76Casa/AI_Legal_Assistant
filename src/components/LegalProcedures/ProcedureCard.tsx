import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Procedure } from '../../hooks/useProceduresLogic';

interface ProcedureCardProps {
    procedure: Procedure;
    index: number;
    onQuestionClick: (question: string) => void;
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure, index, onQuestionClick }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/5 hover:border-primary/20 transition-all group"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-white/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                    {procedure.icon}
                </div>
                <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h3 className="font-serif text-2xl text-white mb-4">{procedure.title}</h3>
            <p className="text-slate-400 mb-8 font-light line-clamp-2 text-sm md:text-base">{procedure.description}</p>

            <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    {t('procedures_page.common_questions')}
                </p>
                {procedure.questions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => onQuestionClick(q)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-primary/10 hover:text-primary transition-all text-left group/btn"
                    >
                        <span className="line-clamp-2">{q}</span>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </button>
                ))}
            </div>
        </motion.div>
    );
};
