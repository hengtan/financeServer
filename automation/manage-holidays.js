#!/usr/bin/env node
/**
 * Gerenciador de Feriados
 *
 * Comandos:
 * - node manage-holidays.js check [data]       - Verifica se é dia útil
 * - node manage-holidays.js list [ano]         - Lista feriados do ano
 * - node manage-holidays.js add YYYY-MM-DD "Nome do Feriado"
 * - node manage-holidays.js remove YYYY-MM-DD
 */

const {
  isWorkday,
  listHolidays,
  addManualHoliday,
  removeManualHoliday,
  formatDate
} = require('./checkWorkday');

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
📅 Gerenciador de Feriados

Comandos disponíveis:

  check [YYYY-MM-DD]              Verifica se é dia útil (hoje se não especificar)
  list [ano]                      Lista feriados do ano (ano atual se não especificar)
  add YYYY-MM-DD "Nome"           Adiciona feriado manual
  remove YYYY-MM-DD               Remove feriado manual

Exemplos:

  node manage-holidays.js check
  node manage-holidays.js check 2025-12-31
  node manage-holidays.js list 2025
  node manage-holidays.js add 2025-12-24 "Véspera de Natal"
  node manage-holidays.js remove 2025-12-24
  `);
}

switch (command) {
  case 'check': {
    const dateStr = args[1];
    const date = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    const check = isWorkday(date);

    console.log(`\n📅 ${formatDate(date)}\n`);

    if (check.isWorkday) {
      console.log('✅ DIA ÚTIL - Scripts devem executar\n');
    } else {
      console.log(`❌ NÃO É DIA ÚTIL - ${check.reason}`);
      if (check.dayName) console.log(`   ${check.dayName}`);
      if (check.holiday) console.log(`   ${check.holiday} (${check.type})`);
      console.log('');
    }
    break;
  }

  case 'list': {
    const year = args[1] ? parseInt(args[1]) : new Date().getFullYear();
    listHolidays(year);
    break;
  }

  case 'add': {
    const dateStr = args[1];
    const name = args[2];

    if (!dateStr || !name) {
      console.log('❌ Erro: Informe a data e o nome do feriado');
      console.log('   Exemplo: node manage-holidays.js add 2025-12-24 "Véspera de Natal"\n');
      break;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.log('❌ Erro: Data deve estar no formato YYYY-MM-DD');
      console.log('   Exemplo: 2025-12-24\n');
      break;
    }

    addManualHoliday(dateStr, name);
    break;
  }

  case 'remove': {
    const dateStr = args[1];

    if (!dateStr) {
      console.log('❌ Erro: Informe a data do feriado');
      console.log('   Exemplo: node manage-holidays.js remove 2025-12-24\n');
      break;
    }

    removeManualHoliday(dateStr);
    break;
  }

  default:
    showHelp();
}
