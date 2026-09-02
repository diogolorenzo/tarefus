import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import type { PermissionRole } from '../../types';
import {
  CheckSquare2,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthPage: React.FC = () => {
  const {
    login,
    register,
    requestPasswordReset,
    resetPassword,
    showToast,
    users,
  } = useTaskContext();

  // A homepage envia para /cadastro, que deve abrir já em "criar conta"
  // (docs/commercial/01-homepage-plan.md, seção 6.4).
  const [mode, setMode] = useState<AuthMode>(() =>
    typeof window !== 'undefined' && window.location.pathname === '/cadastro' ? 'register' : 'login'
  );

  // Form State - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State - Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('');
  const [regPermissionRole, setRegPermissionRole] = useState<PermissionRole>('member');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Form State - Forgot Password
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Pre-fill quick demo account
  const handleQuickLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('123456');
    setFormError(null);
    login(email, '123456', rememberMe);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const res = await login(loginEmail, loginPassword, rememberMe);
    if (!res.success) {
      setFormError(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha corporativos.');
    }
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (regPassword !== regConfirmPassword) {
      setFormError('As senhas digitadas não coincidem.');
      return;
    }

    if (regPassword.length < 6) {
      setFormError('A senha corporativa deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole.trim() || 'Colaborador',
      permissionRole: regPermissionRole,
    });

    if (!res.success) {
      setFormError(res.error || 'Erro ao registrar nova conta corporativa.');
    }
    setIsSubmitting(false);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const res = await requestPasswordReset(forgotEmail.trim());
    if (res.success && res.code) {
      setGeneratedCode(res.code);
      setForgotCode(res.code);
      setForgotStep(2);
      showToast(`Código de recuperação gerado: ${res.code}`, 'info');
    } else {
      setFormError(res.error || 'E-mail corporativo não encontrado.');
    }
    setIsSubmitting(false);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmNewPassword) {
      setFormError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(forgotEmail.trim(), forgotCode.trim(), newPassword);
    if (res.success) {
      showToast('Senha redefinida com sucesso! Você já pode fazer login.', 'success');
      setLoginEmail(forgotEmail);
      setLoginPassword(newPassword);
      setMode('login');
      setForgotStep(1);
      setGeneratedCode(null);
    } else {
      setFormError(res.error || 'Código inválido ou expirado.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-app text-ink flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Gradient Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/25 mb-4 transform hover:scale-105 transition-transform duration-200">
            <CheckSquare2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink leading-tight">
            Tarefus Corporativo
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium mt-1">
            Plataforma Corporativa de Gestão de Fluxos, Tarefas & Equipes
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-surface border border-line shadow-xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all">
          {/* Error Banner */}
          {formError && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: LOGIN */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
                <div>
                  <h2 className="text-lg font-bold text-ink">Acessar Conta</h2>
                  <p className="text-xs text-muted mt-0.5">Insira suas credenciais corporativas</p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold rounded-lg border border-indigo-500/30">
                  Seguro
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>E-mail Corporativo</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ana.silva@empresa.com"
                    className="w-full px-4 py-3 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Senha</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setForgotEmail(loginEmail);
                        setMode('forgot_password');
                      }}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-white/20 bg-[#090D16] text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs text-ink font-medium">Lembrar de mim neste dispositivo</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <span>{isSubmitting ? 'Autenticando...' : 'Entrar na Plataforma'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Access Demo Profiles */}
              <div className="mt-6 pt-5 border-t border-line">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2.5 text-center">
                  Acesso rápido para demonstração (1 clique)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ana.silva@empresa.com')}
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                      <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Admin</span>
                    </div>
                    <p className="text-xs font-bold text-ink truncate mt-0.5">
                      Ana Silva
                    </p>
                    <p className="text-[10px] text-muted truncate">Diretora</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('carlos.mendes@empresa.com')}
                    className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                      <Briefcase className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>Gestor</span>
                    </div>
                    <p className="text-xs font-bold text-ink truncate mt-0.5">
                      Carlos M.
                    </p>
                    <p className="text-[10px] text-muted truncate">Operações</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('beatriz.lima@empresa.com')}
                    className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                      <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Membro</span>
                    </div>
                    <p className="text-xs font-bold text-ink truncate mt-0.5">
                      Beatriz L.
                    </p>
                    <p className="text-[10px] text-muted truncate">Marketing</p>
                  </button>
                </div>
              </div>

              {/* Toggle to Register */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted">
                  Novo colaborador na empresa?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setMode('register');
                    }}
                    className="font-bold text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Criar conta corporativa
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: REGISTER */}
          {/* ========================================================================= */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-line">
                <div>
                  <h2 className="text-lg font-bold text-ink">Novo Colaborador</h2>
                  <p className="text-xs text-muted mt-0.5">Cadastre seu acesso corporativo</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30">
                  Registro
                </span>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-3.5 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>E-mail Corporativo</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="joao.silva@empresa.com"
                    className="w-full px-3.5 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                {/* Role / Position */}
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Cargo / Função</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    placeholder="Ex: Engenheiro de Software, Analista..."
                    className="w-full px-3.5 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>

                {/* Role Selector (RBAC Level) */}
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Nível de Acesso (RBAC)</span>
                  </label>
                  <select
                    value={regPermissionRole}
                    onChange={(e) => setRegPermissionRole(e.target.value as PermissionRole)}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 bg-sunken border border-line rounded-xl text-xs font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 cursor-pointer bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2393a1b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M4 6l4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_0.75rem_center]"
                  >
                    <option value="member">Membro / Executor (Acesso aos quadros e tarefas)</option>
                    <option value="manager">Gestor (Criação e administração de quadros)</option>
                    {users.length === 0 && (
                      <option value="admin">Administrador (Controle total da empresa)</option>
                    )}
                  </select>
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      Senha
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      className="w-full px-3.5 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full px-3.5 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
                >
                  <span>{isSubmitting ? 'Registrando...' : 'Concluir Cadastro Corporativo'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>

              {/* Toggle to Login */}
              <div className="mt-5 pt-4 border-t border-line text-center">
                <p className="text-xs text-muted">
                  Já possui acesso?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setMode('login');
                    }}
                    className="font-bold text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Voltar ao login
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: FORGOT PASSWORD (2 STEPS) */}
          {/* ========================================================================= */}
          {mode === 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-line">
                <div>
                  <h2 className="text-lg font-bold text-ink">Recuperação de Senha</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {forgotStep === 1
                      ? 'Informe seu e-mail corporativo'
                      : 'Defina uma nova senha para sua conta'}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30">
                  Etapa {forgotStep}/2
                </span>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>E-mail Corporativo Cadastrado</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu.email@empresa.com"
                      className="w-full px-4 py-3 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    Será gerado um código de validação corporativa para autorizar a redefinição da sua senha.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Verificando...' : 'Gerar Código de Recuperação'}</span>
                    <KeyRound className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Generated Code Simulation Callout */}
                  {generatedCode && (
                    <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
                        Código de Redefinição Gerado:
                      </span>
                      <div className="text-lg font-mono font-black text-ink tracking-widest mt-0.5">
                        {generatedCode}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                      Código de 6 Dígitos
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      placeholder="000000"
                      className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-center text-base font-mono font-bold text-ink tracking-widest focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-medium text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Atualizando...' : 'Salvar Nova Senha'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Return to Login */}
              <div className="mt-5 pt-4 border-t border-line text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setMode('login');
                    setForgotStep(1);
                  }}
                  className="text-xs font-bold text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  ← Cancelar e voltar ao login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-medium text-subtle">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ambiente Single-Tenant</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Controle RBAC Ativo</span>
          </span>
        </div>
      </div>
    </div>
  );
};
