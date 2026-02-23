import React, { useState } from 'react';
import { User, Mail, Building, BarChart3, Loader2, CheckCircle2, X } from 'lucide-react';

interface EnterpriseLeadFormProps {
    onClose: () => void;
}

export const EnterpriseLeadForm: React.FC<EnterpriseLeadFormProps> = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        estimatedVolume: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simular envío de lead (en producción esto iría a una Edge Function o CRM)
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Solicitud Recibida!</h2>
                <p className="text-slate-400">
                    Nuestro equipo especializado en Enterprise revisará tu perfil y te contactará en menos de 24 horas para una demo personalizada.
                </p>
                <button
                    onClick={onClose}
                    className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all"
                >
                    Cerrar
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                title="Cerrar"
            >
                <X size={24} />
            </button>

            <div className="mb-8">
                <div className="w-12 h-12 bg-primary/15 text-primary rounded-xl flex items-center justify-center mb-4 border border-primary/20">
                    <Building size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Consultoría Enterprise</h2>
                <p className="text-slate-400 text-sm mt-2">
                    Para organizaciones con alto volumen de expedientes o necesidades de personalización avanzadas.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-600"
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-600"
                            placeholder="Email Corporativo"
                        />
                    </div>
                    <div className="relative">
                        <Building className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-600"
                            placeholder="Nombre de la Firma / Empresa"
                        />
                    </div>
                    <div className="relative">
                        <BarChart3 className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            required
                            value={formData.estimatedVolume}
                            onChange={(e) => setFormData({ ...formData, estimatedVolume: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-white placeholder:text-slate-600"
                            placeholder="Volumen de expedientes estimado / mes"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 mt-4"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Enviando solicitud...
                        </>
                    ) : (
                        "Hablar con Especialista Enterprise"
                    )}
                </button>

                <p className="text-[10px] text-center text-slate-600 px-4">
                    Al enviar este formulario, aceptas que nuestro equipo comercial se ponga en contacto contigo para fines profesionales relacionados con LegalFlow Enterprise.
                </p>
            </form>
        </div>
    );
};
