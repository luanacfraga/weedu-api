import { ActionLateStatus, ActionStatus } from '@/core/domain/shared/enums';

/**
 * Labels em português para exibição no SMS de ação atrasada.
 * Usado quando a ação está atrasada (isLate) ou quando queremos informar o status atual.
 */
export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  [ActionStatus.TODO]: 'a iniciar',
  [ActionStatus.IN_PROGRESS]: 'em andamento',
  [ActionStatus.DONE]: 'concluída',
};

/**
 * Labels para o tipo de atraso (lateStatus).
 * Prioridade na mensagem: se houver lateStatus, usamos este; senão, o status da ação.
 */
export const ACTION_LATE_STATUS_LABELS: Record<ActionLateStatus, string> = {
  [ActionLateStatus.LATE_TO_START]: 'atrasada para iniciar',
  [ActionLateStatus.LATE_TO_FINISH]: 'atrasada para concluir',
  [ActionLateStatus.COMPLETED_LATE]: 'concluída com atraso',
};

export type OverdueActionSmsParams = {
  /** Título da tarefa/ação */
  taskTitle: string;
  /** Status atual da ação (TODO, IN_PROGRESS, DONE) */
  status: ActionStatus;
  /** Tipo de atraso, se houver (quando isLate = true) */
  lateStatus: ActionLateStatus | null;
  /** Data prevista de início (prazo para iniciar) */
  estimatedStartDate: Date;
  /** Data prevista de conclusão (prazo para concluir) */
  estimatedEndDate: Date;
};

/**
 * Formata a data para exibição no SMS (ex.: "09/02/2026").
 */
function formatDeadline(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Retorna o texto de status para a mensagem: prioriza lateStatus (atraso) quando existir.
 */
function getStatusText(
  status: ActionStatus,
  lateStatus: ActionLateStatus | null,
): string {
  if (lateStatus !== null) {
    return ACTION_LATE_STATUS_LABELS[lateStatus];
  }
  return ACTION_STATUS_LABELS[status];
}

/**
 * Template da mensagem SMS enviada via Twilio para usuários com ações atrasadas.
 *
 * Exemplo de saída:
 * "Atenção: sua tarefa (Implementar login) está com status (atrasada para concluir) com prazo até dia 15/02/2026."
 *
 * Limite sugerido para título: ~60 caracteres, para manter 1 segmento SMS (160 chars) quando possível.
 */
export const OVERDUE_ACTION_SMS_TEMPLATE =
  'Atenção: sua tarefa ({taskTitle}) está com status ({status}) com prazo até dia {deadline}.';

/** Título truncado além deste tamanho para evitar SMS multi-segmento (custo maior). */
export const MAX_TASK_TITLE_LENGTH_SMS = 60;

/**
 * Define qual data exibir como prazo: início para "atrasada para iniciar", fim para os demais.
 */
function getDeadlineForMessage(
  lateStatus: ActionLateStatus | null,
  estimatedStartDate: Date,
  estimatedEndDate: Date,
): Date {
  if (lateStatus === ActionLateStatus.LATE_TO_START) {
    return estimatedStartDate;
  }
  return estimatedEndDate;
}

/**
 * Monta o corpo da mensagem SMS para notificação de ação atrasada.
 * Substitui os placeholders pelo conteúdo real.
 */
/**
 * Trunca e limpa o título para uso no SMS (evita quebra de linha e mensagem longa).
 */
function prepareTaskTitleForSms(title: string, maxLength: number): string {
  const trimmed = title.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength - 3) + '...';
}

export function buildOverdueActionSmsBody(
  params: OverdueActionSmsParams,
): string {
  const statusText = getStatusText(params.status, params.lateStatus);
  const deadline = getDeadlineForMessage(
    params.lateStatus,
    params.estimatedStartDate,
    params.estimatedEndDate,
  );
  const deadlineStr = formatDeadline(deadline);
  const taskTitle = prepareTaskTitleForSms(
    params.taskTitle,
    MAX_TASK_TITLE_LENGTH_SMS,
  );

  return OVERDUE_ACTION_SMS_TEMPLATE.replace('{taskTitle}', taskTitle)
    .replace('{status}', statusText)
    .replace('{deadline}', deadlineStr);
}
