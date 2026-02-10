#!/bin/bash

# Script para testar o endpoint de notificações

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testando endpoint de notificações de ações atrasadas${NC}\n"

# Obter token JWT (ajuste o email/password conforme necessário)
echo -e "${YELLOW}📝 Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "luana.cam20@gmail.com",
    "password": "sua_senha_aqui"
  }')

# Extrair o token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro ao obter token. Verifique suas credenciais.${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Token obtido com sucesso${NC}\n"

# Chamar o endpoint de notificações
echo -e "${YELLOW}🔔 Acionando endpoint de notificações...${NC}\n"
NOTIFICATION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/notifications/trigger-overdue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo -e "${GREEN}📨 Resposta:${NC}"
echo $NOTIFICATION_RESPONSE | jq '.' || echo $NOTIFICATION_RESPONSE

echo -e "\n${YELLOW}💡 Verifique os logs da aplicação para mais detalhes${NC}"
