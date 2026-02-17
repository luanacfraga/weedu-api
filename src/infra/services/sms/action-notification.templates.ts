import { ActionLateStatus, ActionStatus } from '@/core/domain/shared/enums';

function buildPlatformUrl(): string {
  return (process.env.FRONTEND_URL ?? 'https://app.tooldo.com').replace(
    /\/$/,
    '',
  );
}

export interface MessageTemplateConfig {
  placeholders: number;
  template: string;
}

export type SmsTemplateKey =
  | 'OVERDUE_ACTION'
  | 'ACTION_STARTED'
  | 'ACTION_COMPLETED';

export const MESSAGE_TEMPLATES: Record<SmsTemplateKey, MessageTemplateConfig> =
  {
    OVERDUE_ACTION: {
      placeholders: 4,
      template:
        '⚠️ *ToolDo - Ação Atrasada*\n\nA tarefa *{{1}}* está *{{2}}*.\n\n📅 Prazo: *{{3}}*\n\n🔗 Acesse: {{4}}\n\nAtualize o status diretamente na plataforma.',
    },
    ACTION_STARTED: {
      placeholders: 3,
      template:
        '✅ *ToolDo - Ação Iniciada*\n\nA tarefa *{{1}}* foi iniciada!\n\n📅 Iniciada em: *{{2}}*\n\n🔗 Acesse: {{3}}\n\nContinue acompanhando o progresso.',
    },
    ACTION_COMPLETED: {
      placeholders: 3,
      template:
        '🎉 *ToolDo - Ação Concluída*\n\nParabéns! A tarefa *{{1}}* foi concluída com sucesso!\n\n✅ Concluída em: *{{2}}*\n\n🔗 Acesse: {{3}}\n\nVeja os detalhes e próximos passos.',
    },
  };

/** @deprecated use MESSAGE_TEMPLATES */
export const SMS_TEMPLATES = MESSAGE_TEMPLATES;

export const TEMPLATE_PLACEHOLDERS: Record<SmsTemplateKey, number> = {
  OVERDUE_ACTION: MESSAGE_TEMPLATES.OVERDUE_ACTION.placeholders,
  ACTION_STARTED: MESSAGE_TEMPLATES.ACTION_STARTED.placeholders,
  ACTION_COMPLETED: MESSAGE_TEMPLATES.ACTION_COMPLETED.placeholders,
};

export function buildSmsFromTemplate(
  templateKey: SmsTemplateKey,
  variables: string[],
): string {
  const config = MESSAGE_TEMPLATES[templateKey];
  if (variables.length !== config.placeholders) {
    throw new Error(
      `Template "${templateKey}": esperadas ${config.placeholders} variáveis, recebidas ${variables.length}.`,
    );
  }
  let message = config.template;
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

export const MAX_TASK_TITLE_LENGTH = 60;

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
  return `${day}/${month}/${d.getFullYear()}`;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()} às ${hours}:${minutes}`;
}

function getStatusText(
  status: ActionStatus,
  lateStatus: ActionLateStatus | null,
): string {
  return lateStatus !== null
    ? ACTION_LATE_STATUS_LABELS[lateStatus]
    : ACTION_STATUS_LABELS[status];
}

function getDeadlineForMessage(
  lateStatus: ActionLateStatus | null,
  estimatedStartDate: Date,
  estimatedEndDate: Date,
): Date {
  return lateStatus === ActionLateStatus.LATE_TO_START
    ? estimatedStartDate
    : estimatedEndDate;
}

function truncateTitle(title: string): string {
  const trimmed = title.trim().replace(/\s+/g, ' ');
  return trimmed.length <= MAX_TASK_TITLE_LENGTH
    ? trimmed
    : trimmed.slice(0, MAX_TASK_TITLE_LENGTH - 3) + '...';
}

/** @deprecated use MAX_TASK_TITLE_LENGTH */
export const MAX_TASK_TITLE_LENGTH_SMS = MAX_TASK_TITLE_LENGTH;

export function buildOverdueActionVariables(
  params: OverdueActionSmsParams,
): [string, string, string, string] {
  return [
    truncateTitle(params.taskTitle),
    getStatusText(params.status, params.lateStatus),
    formatDeadline(
      getDeadlineForMessage(
        params.lateStatus,
        params.estimatedStartDate,
        params.estimatedEndDate,
      ),
    ),
    buildPlatformUrl(),
  ];
}

export function buildOverdueActionSmsBody(
  params: OverdueActionSmsParams,
): string {
  return buildSmsFromTemplate(
    'OVERDUE_ACTION',
    buildOverdueActionVariables(params),
  );
}

export type ActionStartedSmsParams = {
  taskTitle: string;
  startedDate: Date;
};

export function buildActionStartedVariables(
  params: ActionStartedSmsParams,
): [string, string, string] {
  return [
    truncateTitle(params.taskTitle),
    formatDate(params.startedDate),
    buildPlatformUrl(),
  ];
}

export function buildActionStartedSmsBody(
  params: ActionStartedSmsParams,
): string {
  return buildSmsFromTemplate(
    'ACTION_STARTED',
    buildActionStartedVariables(params),
  );
}

export type ActionCompletedSmsParams = {
  taskTitle: string;
  completedDate: Date;
};

export function buildActionCompletedVariables(
  params: ActionCompletedSmsParams,
): [string, string, string] {
  return [
    truncateTitle(params.taskTitle),
    formatDate(params.completedDate),
    buildPlatformUrl(),
  ];
}

export function buildActionCompletedSmsBody(
  params: ActionCompletedSmsParams,
): string {
  return buildSmsFromTemplate(
    'ACTION_COMPLETED',
    buildActionCompletedVariables(params),
  );
}
