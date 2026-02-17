# Configuração do Twilio para SMS e WhatsApp

Este guia explica como configurar o Twilio para enviar notificações de SMS e WhatsApp no ToolDo.

## 📋 Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no arquivo `.env`:

```bash
# Credenciais principais do Twilio (OBRIGATÓRIAS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567

# Template WhatsApp (OPCIONAL - apenas se usar WhatsApp)
TWILIO_WHATSAPP_OVERDUE_ACTION_CONTENT_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔧 Passo a Passo: Configuração na Conta Twilio

### 1️⃣ Criar Conta no Twilio

1. Acesse [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Crie sua conta (você ganha créditos gratuitos para teste)
3. Verifique seu email e telefone

### 2️⃣ Obter Credenciais Principais

Após login no [Twilio Console](https://console.twilio.com/):

**TWILIO_ACCOUNT_SID** e **TWILIO_AUTH_TOKEN**:
- Na dashboard principal, você verá uma seção "Account Info"
- Copie o **Account SID** e o **Auth Token**
- ⚠️ **NUNCA** compartilhe seu Auth Token publicamente

### 3️⃣ Configurar Número de Telefone para SMS

**TWILIO_PHONE_NUMBER**:

1. No menu lateral, vá em **Phone Numbers** → **Manage** → **Buy a number**
2. Selecione um país (ex: United States) e as capabilities desejadas:
   - ✅ **SMS** (obrigatório)
   - ✅ **Voice** (opcional)
3. Clique em **Search** e escolha um número
4. Clique em **Buy** para adquirir o número
5. Copie o número no formato E.164: `+15551234567`

> **Nota para Brasil**: Números brasileiros no Twilio requerem processo de registro regulatório (A2P 10DLC). Para testes, use números internacionais.

### 4️⃣ Configurar WhatsApp (OPCIONAL)

Se você quiser enviar mensagens via WhatsApp:

#### 4.1. Configurar WhatsApp Sender

1. No menu lateral, vá em **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Siga o wizard para conectar o WhatsApp Sandbox ou configurar seu número WhatsApp Business
3. Para **produção**, você precisa de um **número WhatsApp Business aprovado**

#### 4.2. Criar Template de Conteúdo (Content Template)

**TWILIO_WHATSAPP_OVERDUE_ACTION_CONTENT_SID**:

1. Acesse **Messaging** → **Content Editor** (ou Content API)
2. Clique em **Create new Content Template**
3. Preencha os dados do template:

   **Template Name**: `overdue_action_notification`

   **Language**: Portuguese (pt-BR)

   **Content Type**: WhatsApp

   **Template Body**:
   ```
   Atenção: a tarefa {{1}} está {{2}}. Prazo: {{3}}. Acesse o ToolDo para mais detalhes.
   ```

   **Variables**:
   - `{{1}}` - Título da tarefa
   - `{{2}}` - Status (ex: "atrasada para iniciar")
   - `{{3}}` - Data do prazo (ex: "09/02/2026")

4. Clique em **Submit for Approval** (WhatsApp precisa aprovar templates)
5. Após aprovação, copie o **Content SID** (começa com `HX...`)
6. Cole no `.env` como `TWILIO_WHATSAPP_OVERDUE_ACTION_CONTENT_SID`

> **⚠️ Importante**: Templates de WhatsApp precisam ser **pré-aprovados pelo WhatsApp** antes de serem usados. Isso pode levar de algumas horas a alguns dias.

## 🧪 Testando a Configuração

### Teste de SMS

Após configurar as 3 variáveis obrigatórias, o SMS já deve funcionar:

```typescript
// A aplicação enviará SMS automaticamente quando uma ação estiver atrasada
// Você também pode testar usando o serviço diretamente:
await sendOverdueActionNotificationService.execute('+5511999999999', {
  taskTitle: 'Revisar código',
  status: ActionStatus.TODO,
  lateStatus: ActionLateStatus.LATE_TO_START,
  estimatedStartDate: new Date('2026-02-08'),
  estimatedEndDate: new Date('2026-02-10'),
});
```

### Teste de WhatsApp (Sandbox para desenvolvimento)

Para testes sem aprovar templates:

1. No Twilio Console, vá em **Messaging** → **Try it out** → **WhatsApp Sandbox**
2. Escaneie o QR code com WhatsApp para conectar seu número ao sandbox
3. Envie a mensagem de confirmação solicitada (ex: "join [seu-código]")
4. Agora você pode receber mensagens de teste nesse número

> **Nota**: No sandbox, você **não precisa** do Content SID. Para produção, o template é obrigatório.

## 🔐 Segurança

- ✅ **NUNCA** commite o arquivo `.env` no Git
- ✅ Use `.env.example` como referência (sem valores reais)
- ✅ Em produção, use variáveis de ambiente do servidor/cloud
- ✅ Rotacione o Auth Token periodicamente
- ✅ Habilite autenticação de dois fatores na conta Twilio

## 💰 Custos

Valores aproximados (consulte [twilio.com/pricing](https://www.twilio.com/pricing)):

- **SMS**: ~$0.0075 USD por mensagem (varia por país)
- **WhatsApp**: ~$0.005-0.01 USD por mensagem business-initiated
- **Número de telefone**: ~$1-2 USD por mês

> **Créditos de teste**: Twilio oferece créditos gratuitos para novos usuários testarem os serviços.

## 🐛 Troubleshooting

### Erro: "TWILIO_ACCOUNT_SID é obrigatória"

✅ Verifique se todas as variáveis de ambiente estão configuradas no `.env`

### SMS não está sendo enviado

1. ✅ Verifique se o número está no formato E.164: `+[código país][número]`
2. ✅ Confira os logs da aplicação para mensagens de erro
3. ✅ Verifique o saldo da conta no Twilio Console
4. ✅ Confira se o número de destino não está na blacklist

### WhatsApp não está sendo enviado

1. ✅ Verifique se o Content SID está correto
2. ✅ Confirme que o template foi **aprovado** pelo WhatsApp
3. ✅ Certifique-se de que o número de destino está registrado no sandbox (desenvolvimento)
4. ✅ Para produção, verifique se tem um número WhatsApp Business aprovado

### Erro: "WhatsApp Content SID não configurado"

✅ A variável `TWILIO_WHATSAPP_OVERDUE_ACTION_CONTENT_SID` é opcional. Se não configurada, apenas o SMS será enviado (WhatsApp será ignorado silenciosamente).

## 📚 Referências

- [Twilio Console](https://console.twilio.com/)
- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart)
- [Twilio WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [Content API Templates](https://www.twilio.com/docs/content-api/content-types)
- [E.164 Phone Format](https://www.twilio.com/docs/glossary/what-e164)

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs da aplicação (procure por `TwilioSmsServiceImpl` ou `TwilioWhatsappServiceImpl`)
2. Consulte o [Twilio Support](https://support.twilio.com/)
3. Revise a documentação oficial do Twilio
