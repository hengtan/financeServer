#!/bin/bash

# Script de Limpeza COMPLETA do Banco de Dados
# Remove TODOS os dados de TODAS as tabelas
# USO: ./scripts/cleanup-database.sh

set -e

echo "🧹 Iniciando limpeza COMPLETA do banco de dados..."
echo "⚠️  ATENÇÃO: Este script irá remover TODOS OS DADOS do banco!"
echo "⚠️  O usuário sandbox será recriado automaticamente no próximo login"
echo ""

# Verifica se está em ambiente de desenvolvimento
if [[ "$NODE_ENV" == "production" ]]; then
  echo "❌ ERRO: Este script não pode ser executado em produção!"
  exit 1
fi

# Confirmação do usuário
read -p "Deseja continuar? (digite 'SIM' para confirmar): " confirm

if [[ "$confirm" != "SIM" ]]; then
  echo "❌ Operação cancelada pelo usuário"
  exit 0
fi

echo ""
echo "📊 Executando migration de limpeza completa..."

# Executa a migration SQL diretamente no banco
npx prisma db execute \
  --file ./prisma/migrations/cleanup_all_data.sql \
  --schema ./prisma/schema.prisma

echo ""
echo "✅ Limpeza completa concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Faça login com email contendo 'sandbox' e senha 'sandbox'"
echo "  2. O usuário sandbox será criado automaticamente"
echo "  3. Execute npm run seed para popular dados de exemplo (opcional)"
echo ""
