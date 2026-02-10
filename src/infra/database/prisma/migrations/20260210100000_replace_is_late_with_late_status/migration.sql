-- Migração: substituir is_late (boolean) por late_status (string enum)
-- Converte o valor existente: is_late=true → NULL (recalculado pela aplicação)
-- As ações terão late_status recalculado na próxima requisição pelo list-actions service

ALTER TABLE "actions" ADD COLUMN "late_status" TEXT;

-- Dados existentes: não há como converter boolean → enum específico sem contexto de datas
-- O list-actions.service recalculará e sincronizará na próxima execução

ALTER TABLE "actions" DROP COLUMN "is_late";
