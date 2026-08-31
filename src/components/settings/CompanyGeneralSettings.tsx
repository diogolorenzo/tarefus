import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { canManageCompany } from '../../utils/rbac';
import {
  Building2,
  Hash,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Save,
  Check,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const CompanyGeneralSettings: React.FC = () => {
  const { company, currentUser, updateCompany } = useTaskContext();
  const canManage = canManageCompany(currentUser);

  const [name, setName] = useState(company?.name || '');
  const [cnpj, setCNPJ] = useState(company?.cnpj || '');
  const [email, setEmail] = useState(company?.email || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [segment, setSegment] = useState(company?.segment || '');
  const [description, setDescription] = useState(company?.description || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !name.trim()) return;

    updateCompany({
      name: name.trim(),
      cnpj: cnpj.trim(),
      email: email.trim(),
      phone: phone.trim(),
      segment: segment.trim(),
      description: description.trim(),
    });

    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
    }, 3000);
  };

  const formattedUpdatedAt = company?.updatedAt
    ? new Date(company.updatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Dados da Empresa</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure a identidade organizacional, dados cadastrais e canais de contato
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!canManage && (
            <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl font-bold border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" /> Somente Leitura (Restrito a Administradores)
            </span>
          )}

          {formattedUpdatedAt && (
            <div className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5" />
              <span>Última atualização: {formattedUpdatedAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cadastro Corporativo</span>
            </h3>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Razão Social / Nome da Empresa</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!canManage}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Acme Inovações Tecnológicas S/A"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Two-column grid: CNPJ and Segment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>CNPJ</span>
                </label>
                <input
                  type="text"
                  disabled={!canManage}
                  value={cnpj}
                  onChange={(e) => setCNPJ(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Ramo / Segmento</span>
                </label>
                <input
                  type="text"
                  disabled={!canManage}
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="Ex: Tecnologia & Serviços"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Two-column grid: Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>E-mail Corporativo</span>
                </label>
                <input
                  type="email"
                  disabled={!canManage}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@empresa.com.br"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Telefone de Contato</span>
                </label>
                <input
                  type="text"
                  disabled={!canManage}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Description / Slogan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Descrição / Slogan Institucional</span>
              </label>
              <textarea
                rows={3}
                disabled={!canManage}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a missão ou área de atuação da organização..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Save Button / Read Only Notice */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isSavedRecently && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Informações salvas com sucesso!
                  </span>
                )}
                {!canManage && (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Modificações desabilitadas para seu perfil de acesso.
                  </span>
                )}
              </span>
              {canManage && (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Informações da Empresa</span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Right Column: Company Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Identidade Organizacional
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                Ativo
              </span>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-md relative overflow-hidden mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black tracking-tight line-clamp-1">{name || 'Nome da Empresa'}</h4>
              {segment && <p className="text-xs text-blue-100 font-medium mt-0.5">{segment}</p>}
              {description && (
                <p className="text-xs text-blue-50/90 mt-2.5 line-clamp-2 leading-relaxed bg-white/10 p-2.5 rounded-xl backdrop-blur-2xs">
                  “{description}”
                </p>
              )}
            </div>

            {/* Details List */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                <span className="text-slate-400 dark:text-slate-500">CNPJ</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
                  {cnpj || 'Não informado'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.05]">
                <span className="text-slate-400 dark:text-slate-500">E-mail</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">
                  {email || 'Não informado'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 dark:text-slate-500">Telefone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {phone || 'Não informado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
