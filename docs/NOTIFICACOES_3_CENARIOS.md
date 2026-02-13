# Verificação: envio de notificações nos 3 cenários

Este documento descreve como o envio de notificações (SMS e WhatsApp) está conectado para os três cenários.

---

## Cenário 1: Ação atrasada (OVERDUE_ACTION)

**Status: CONECTADO**

### Quando dispara
- **Cron diário (9h, America/Sao_Paulo):** `OverdueActionNotificationCron` busca ações TODO/IN_PROGRESS atrasadas por empresa e envia uma notificação por ação ao responsável (telefone).
- **UpdateActionService:** quando, após atualizar a ação, ela passa a estar atrasada (`becameLate`: antes `lateStatus === null`, depois `calculateLateStatus(now) !== null`).
- **MoveActionService:** quando, ao mover o card, a ação passa a estar atrasada (`action.lateStatus === null` e `result.action.lateStatus !== null`).

### Serviço
- `SendOverdueActionNotificationService.execute(actionId, userId, phone, params, notificationPreference)`
- Params: `taskTitle`, `status`, `lateStatus`, `estimatedStartDate`, `estimatedEndDate`
- Template: OVERDUE_ACTION (4 variáveis: título, status, prazo, link)
- Respeita `company.notificationPreference` (SMS only, WhatsApp only, both)
- Evita duplicata: não envia se já enviou notificação hoje para a mesma ação/usuário
- Registra no histórico: `ActionNotification` (ActionNotificationRepository)

### Arquivos
- `application/services/notification/send-overdue-action-notification.service.ts`
- `application/services/notification/overdue-action-notification.cron.ts`
- `application/services/action/update-action.service.ts` (bloco `becameLate`)
- `application/services/action/move-action.service.ts` (bloco atrasada)

---

## Cenário 2: Ação iniciada (ACTION_STARTED)

**Status: CONECTADO**

### Quando dispara
- **UpdateActionService:** quando o status muda de TODO para IN_PROGRESS e `actualStartDate` é definido (campo enviado no update).
- **MoveActionService:** quando a ação é movida de TODO para IN_PROGRESS (o entity define `actualStartDate = new Date()` automaticamente).

### Serviço
- `SendActionLifecycleNotificationService.sendActionStarted(actionId, userId, phone, params, notificationPreference?)`
- Params: `taskTitle`, `startedDate`
- Template: ACTION_STARTED (3 variáveis: título, data/hora início, link)
- Respeita `company.notificationPreference`

### Arquivos
- `application/services/notification/send-action-lifecycle-notification.service.ts`
- `application/services/action/update-action.service.ts` (bloco “ação iniciada”)
- `application/services/action/move-action.service.ts` (bloco “ação iniciada”)

---

## Cenário 3: Ação concluída (ACTION_COMPLETED)

**Status: CONECTADO**

### Quando dispara
- **UpdateActionService:** quando o status muda para DONE e `actualEndDate` é definido (campo enviado no update).
- **MoveActionService:** quando a ação é movida para DONE (o entity define `actualEndDate = new Date()` automaticamente).

### Serviço
- `SendActionLifecycleNotificationService.sendActionCompleted(actionId, userId, phone, params, notificationPreference?)`
- Params: `taskTitle`, `completedDate`
- Template: ACTION_COMPLETED (3 variáveis: título, data/hora conclusão, link)
- Respeita `company.notificationPreference`

### Arquivos
- `application/services/notification/send-action-lifecycle-notification.service.ts`
- `application/services/action/update-action.service.ts` (bloco “ação concluída”)
- `application/services/action/move-action.service.ts` (bloco “ação concluída”)

---

## Resumo

| Cenário        | Template          | Cron 9h | UpdateActionService | MoveActionService |
|----------------|-------------------|--------|----------------------|-------------------|
| Ação atrasada  | OVERDUE_ACTION   | Sim    | Sim (ficou atrasada) | Sim (ficou atrasada) |
| Ação iniciada  | ACTION_STARTED   | Não    | Sim (TODO→IN_PROGRESS) | Sim (→IN_PROGRESS) |
| Ação concluída | ACTION_COMPLETED | Não    | Sim (→DONE)         | Sim (→DONE)       |

---

## Dependências

- **SMS:** `SmsService` (Twilio) — mensagem montada no código.
- **WhatsApp:** `WhatsappService` (Twilio Content API) — templates cadastrados no Twilio e Content SIDs no `.env`:
  - `TWILIO_WHATSAPP_OVERDUE_ACTION_CONTENT_SID`
  - `TWILIO_WHATSAPP_ACTION_STARTED_CONTENT_SID`
  - `TWILIO_WHATSAPP_ACTION_COMPLETED_CONTENT_SID`
- **Preferência por canal:** `company.notificationPreference` (SMS only, WhatsApp only, both).
- **Telefone:** obrigatório no usuário responsável; formato E.164; ignorado se vazio ou prefixo `temp_`.

Os três cenários estão implementados e conectados aos fluxos de atualização e movimentação de ações.
