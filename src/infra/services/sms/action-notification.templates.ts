import { ActionLateStatus, ActionStatus } from '@/core/domain/shared/enums';

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'https://app.tooldo.com';
}

function buildPlatformUrl(): string {
  return getFrontendUrl().replace(/\/$/, '');
}

export interface SmsTemplateConfig {
  placeholders: number;
  template: string;
  whatsappTemplate?: string; // Template mais rico para WhatsApp com emojis
}

export type SmsTemplateKey =
  | 'OVERDUE_ACTION'
  | 'ACTION_STARTED'
  | 'ACTION_COMPLETED';

export const SMS_TEMPLATES: Record<SmsTemplateKey, SmsTemplateConfig> = {
  OVERDUE_ACTION: {
    placeholders: 4,
    template:
      '⚠️ ToolDo: A tarefa "{{1}}" está {{2}}. Prazo: {{3}}. Acesse: {{4}}',
    whatsappTemplate:
      '⚠️ *ToolDo - Ação Atrasada*\n\nA tarefa *{{1}}* está *{{2}}*.\n\n📅 Prazo: *{{3}}*\n\n🔗 Acesse: {{4}}\n\nAtualize o status diretamente na plataforma.',
  },
  ACTION_STARTED: {
    placeholders: 3,
    template:
      '✅ ToolDo: A tarefa "{{1}}" foi iniciada em {{2}}. Acesse: {{3}}',
    whatsappTemplate:
      '✅ *ToolDo - Ação Iniciada*\n\nA tarefa *{{1}}* foi iniciada!\n\n📅 Iniciada em: *{{2}}*\n\n🔗 Acesse: {{3}}\n\nContinue acompanhando o progresso.',
  },
  ACTION_COMPLETED: {
    placeholders: 3,
    template:
      '🎉 ToolDo: Parabéns! A tarefa "{{1}}" foi concluída em {{2}}. Acesse: {{3}}',
    whatsappTemplate:
      '🎉 *ToolDo - Ação Concluída*\n\nParabéns! A tarefa *{{1}}* foi concluída com sucesso!\n\n✅ Concluída em: *{{2}}*\n\n🔗 Acesse: {{3}}\n\nVeja os detalhes e próximos passos.',
  },
};

export const TEMPLATE_PLACEHOLDERS: Record<SmsTemplateKey, number> = {
  OVERDUE_ACTION: SMS_TEMPLATES.OVERDUE_ACTION.placeholders,
  ACTION_STARTED: SMS_TEMPLATES.ACTION_STARTED.placeholders,
  ACTION_COMPLETED: SMS_TEMPLATES.ACTION_COMPLETED.placeholders,
};

export function buildSmsFromTemplate(
  templateKey: SmsTemplateKey,
  variables: string[],
  isWhatsapp = false,
): string {
  const config = SMS_TEMPLATES[templateKey];
  if (variables.length !== config.placeholders) {
    throw new Error(
      `SMS template "${templateKey}": esperadas ${config.placeholders} variáveis, recebidas ${variables.length}.`,
    );
  }

  // Usa template do WhatsApp se disponível e se for WhatsApp, senão usa o SMS padrão
  const template =
    isWhatsapp && config.whatsappTemplate
      ? config.whatsappTemplate
      : config.template;

  let message = template;
  variables.forEach((value, index) => {
    message = message.replace(`{{${index + 1}}}`, value);
  });
  return message;
}

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  [ActionStatus.TODO]: 'a iniciar',
  [ActionStatus.IN_PROGRESS]: 'em andamento',
  [ActionStatus.DONE]: 'concluída',
};

export const ACTION_LATE_STATUS_LABELS: Record<ActionLateStatus, string> = {
  [ActionLateStatus.LATE_TO_START]: 'atrasada para iniciar',
  [ActionLateStatus.LATE_TO_FINISH]: 'atrasada para concluir',
  [ActionLateStatus.COMPLETED_LATE]: 'concluída com atraso',
};

// ============================================================================
// PARÂMETROS E BUILDERS PARA AÇÕES ATRASADAS
// ============================================================================

export type OverdueActionSmsParams = {
  taskTitle: string;
  status: ActionStatus;
  lateStatus: ActionLateStatus | null;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
};

function formatDeadline(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getStatusText(
  status: ActionStatus,
  lateStatus: ActionLateStatus | null,
): string {
  if (lateStatus !== null) {
    return ACTION_LATE_STATUS_LABELS[lateStatus];
  }
  return ACTION_STATUS_LABELS[status];
}

export const MAX_TASK_TITLE_LENGTH_SMS = 60;

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

function prepareTaskTitleForSms(title: string, maxLength: number): string {
  const trimmed = title.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return trimmed.slice(0, maxLength - 3) + '...';
}

export function buildOverdueActionVariables(
  params: OverdueActionSmsParams,
): [string, string, string, string] {
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
  const actionUrl = buildPlatformUrl();
  return [taskTitle, statusText, deadlineStr, actionUrl];
}

export function buildOverdueActionSmsBody(
  params: OverdueActionSmsParams,
  isWhatsapp = false,
): string {
  const variables = buildOverdueActionVariables(params);
  return buildSmsFromTemplate('OVERDUE_ACTION', variables, isWhatsapp);
}

// ============================================================================
// PARÂMETROS E BUILDERS PARA AÇÕES INICIADAS
// ============================================================================

export type ActionStartedSmsParams = {
  taskTitle: string;
  startedDate: Date;
};

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

export function buildActionStartedVariables(
  params: ActionStartedSmsParams,
): [string, string, string] {
  const taskTitle = prepareTaskTitleForSms(
    params.taskTitle,
    MAX_TASK_TITLE_LENGTH_SMS,
  );
  const startedDateStr = formatDate(params.startedDate);
  const actionUrl = buildPlatformUrl();
  return [taskTitle, startedDateStr, actionUrl];
}

export function buildActionStartedSmsBody(
  params: ActionStartedSmsParams,
  isWhatsapp = false,
): string {
  const variables = buildActionStartedVariables(params);
  return buildSmsFromTemplate('ACTION_STARTED', variables, isWhatsapp);
}

// ============================================================================
// PARÂMETROS E BUILDERS PARA AÇÕES CONCLUÍDAS
// ============================================================================

export type ActionCompletedSmsParams = {
  taskTitle: string;
  completedDate: Date;
};

export function buildActionCompletedVariables(
  params: ActionCompletedSmsParams,
): [string, string, string] {
  const taskTitle = prepareTaskTitleForSms(
    params.taskTitle,
    MAX_TASK_TITLE_LENGTH_SMS,
  );
  const completedDateStr = formatDate(params.completedDate);
  const actionUrl = buildPlatformUrl();
  return [taskTitle, completedDateStr, actionUrl];
}

export function buildActionCompletedSmsBody(
  params: ActionCompletedSmsParams,
  isWhatsapp = false,
): string {
  const variables = buildActionCompletedVariables(params);
  return buildSmsFromTemplate('ACTION_COMPLETED', variables, isWhatsapp);
}
