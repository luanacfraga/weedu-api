import { ActionLateStatus, ActionStatus } from '@/core/domain/shared/enums';

export interface SmsTemplateConfig {
  placeholders: number;
  template: string;
}

export type SmsTemplateKey = 'OVERDUE_ACTION';

export const SMS_TEMPLATES: Record<SmsTemplateKey, SmsTemplateConfig> = {
  OVERDUE_ACTION: {
    placeholders: 3,
    template:
      'Atenção: a tarefa {{1}} está {{2}}. Prazo: {{3}}. Acesse o ToolDo para mais detalhes.',
  },
};

export const TEMPLATE_PLACEHOLDERS: Record<SmsTemplateKey, number> = {
  OVERDUE_ACTION: SMS_TEMPLATES.OVERDUE_ACTION.placeholders,
};

export function buildSmsFromTemplate(
  templateKey: SmsTemplateKey,
  variables: string[],
): string {
  const config = SMS_TEMPLATES[templateKey];
  if (variables.length !== config.placeholders) {
    throw new Error(
      `SMS template "${templateKey}": esperadas ${config.placeholders} variáveis, recebidas ${variables.length}.`,
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
): [string, string, string] {
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
  return [taskTitle, statusText, deadlineStr];
}

export function buildOverdueActionSmsBody(
  params: OverdueActionSmsParams,
): string {
  const variables = buildOverdueActionVariables(params);
  return buildSmsFromTemplate('OVERDUE_ACTION', variables);
}
