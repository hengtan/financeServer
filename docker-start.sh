#!/bin/bash

# 🏦 FinanceServer - Docker Setup Script
# Este script facilita o uso do Docker para o FinanceServer

echo "🏦 FinanceServer - Docker Setup"
echo "================================"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale Docker Desktop primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado."
    exit 1
fi

echo "✅ Docker encontrado"

# Menu de opções
echo ""
echo "Selecione uma opção:"
echo "1) 🚀 Subir ambiente completo (primeira vez)"
echo "2) 🔄 Subir ambiente (já configurado)"
echo "3) 📊 Ver status dos containers"
echo "4) 📝 Ver logs do backend"
echo "5) 🛑 Parar todos os containers"
echo "6) 🧹 Limpar tudo (containers + volumes)"
echo "7) 🔨 Rebuild do backend"
echo "8) 📖 Acessar documentação"
echo ""

read -p "Digite sua opção [1-8]: " choice

case $choice in
    1)
        echo "🚀 Subindo ambiente completo..."
        docker-compose up -d
        echo ""
        echo "✅ Ambiente iniciado!"
        echo "🌐 Backend API: http://localhost:3001"
        echo "📖 Documentação: http://localhost:3001/docs"
        echo "🔐 Login sandbox: sandbox@financeserver.dev / sandbox"
        ;;
    2)
        echo "🔄 Subindo ambiente..."
        docker-compose up -d
        echo "✅ Ambiente reiniciado!"
        ;;
    3)
        echo "📊 Status dos containers:"
        docker-compose ps
        ;;
    4)
        echo "📝 Logs do backend (Ctrl+C para sair):"
        docker-compose logs -f backend
        ;;
    5)
        echo "🛑 Parando containers..."
        docker-compose down
        echo "✅ Containers parados!"
        ;;
    6)
        echo "🧹 Limpando tudo..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Limpeza completa!"
        ;;
    7)
        echo "🔨 Rebuild do backend..."
        docker-compose build backend
        docker-compose up -d backend
        echo "✅ Backend rebuilded!"
        ;;
    8)
        echo "📖 Abrindo documentação..."
        if command -v open &> /dev/null; then
            open http://localhost:3001/docs
        else
            echo "🌐 Acesse: http://localhost:3001/docs"
        fi
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Operação concluída!"