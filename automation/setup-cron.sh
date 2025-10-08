#!/bin/bash

# Script para configurar cron job automático

echo "═══════════════════════════════════════════"
echo "   CONFIGURAÇÃO DE AGENDAMENTO AUTOMÁTICO"
echo "═══════════════════════════════════════════"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📂 Diretório do script: $SCRIPT_DIR"
echo ""

echo "📋 Comandos para adicionar ao crontab:"
echo ""
echo "# Batida de entrada (8:50 nos dias úteis)"
echo "50 8 * * 1-5 cd $SCRIPT_DIR && /usr/local/bin/node daily-timesheet.js >> $SCRIPT_DIR/cron.log 2>&1"
echo ""
echo "# Batida de saída (18:00 nos dias úteis)"
echo "0 18 * * 1-5 cd $SCRIPT_DIR && /usr/local/bin/node daily-timesheet.js >> $SCRIPT_DIR/cron.log 2>&1"
echo ""
echo "═══════════════════════════════════════════"
echo ""
echo "📝 Para adicionar ao crontab:"
echo "   1. Execute: crontab -e"
echo "   2. Cole as linhas acima"
echo "   3. Salve e saia"
echo ""
echo "📊 Para ver logs:"
echo "   tail -f $SCRIPT_DIR/cron.log"
echo ""
echo "⚙️  Para testar manualmente:"
echo "   cd $SCRIPT_DIR && node daily-timesheet.js"
echo ""
