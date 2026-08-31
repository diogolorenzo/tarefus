import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { canManageAuditLogs } from '../../utils/rbac';
import {
  History,
  Database,
  RefreshCw,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  Trash2,
  Plus,
} from 'lucide-react';

export const AuditLogsSettings: React.FC = () => {
  const { activityLogs, currentUser, isCloudSynced: _isCloudSynced, reseedDatabase } = useTaskContext();
  const canReseed = canManageAuditLogs(currentUser);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReseeding, setIsReseeding] = useState<boolean>(false);

  const handleReseed = async () => {
    if (!canReseed) return;
    if (window.confirm('Deseja repovoar o banco Firestore com o esquema padrão corporativo?')) {
      setIsReseeding(true);
      await reseedDatabase();
      setIsReseeding(false);
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      (log.taskTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterAction !== 'all') {
      if (filterAction === 'move') {
        if (log.action !== 'move' && log.action !== 'status_change') return false;
      } else if (log.action !== filterAction) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-line">
        <div>
          <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Auditoria & Banco de Dados</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Histórico/Log de atividades corporativas e sincronização em tempo real com Firestore
          </p>
        </div>

        {canReseed && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isReseeding}
              onClick={handleReseed}
              className="px-3.5 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-ink rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
              <span>Repovoar Banco (Seed)</span>
            </button>
          </div>
        )}
      </div>

      {/* Database Connection Status Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-4.5 rounded-2xl border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">
                Google Cloud Firestore (Single-Tenant)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" /> Conectado & Ativo
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Tabelas sincronizadas: Usuários, Quadros, Colunas Kanban, Tarefas e Auditoria.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por responsável, tarefa ou ação..."
            className="w-full pl-9.5 pr-4 py-2 bg-surface border border-line rounded-xl text-xs font-semibold text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'all'
                ? 'bg-surface text-ink shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Todos ({activityLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('create')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'create'
                ? 'bg-surface text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Criações
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('move')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'move'
                ? 'bg-surface text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Movimentações
          </button>
          <button
            type="button"
            onClick={() => setFilterAction('complete')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              filterAction === 'complete'
                ? 'bg-surface text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                : 'text-muted'
            }`}
          >
            Conclusões
          </button>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-ink">Nenhum registro de atividade encontrado</p>
            <p className="text-xs text-subtle mt-1">
              As ações de criação, movimentação e edição de tarefas serão registradas aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {filteredLogs.map((log) => {
              const formattedDate = new Date(log.timestamp).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:px-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      {log.action === 'create' ? (
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : log.action === 'complete' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : log.action === 'delete' ? (
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-ink">
                          {log.userName}
                        </span>
                        <span className="text-xs text-muted">
                          {log.details}
                        </span>
                      </div>
                      {log.taskTitle && (
                        <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                          Tarefa: {log.taskTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-subtle shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
