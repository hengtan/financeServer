/**
 * Verificação do Sistema - Checklist antes de usar
 */

const fs = require('fs');
const path = require('path');
const { isWorkday, formatDate } = require('./checkWorkday');

console.log('═══════════════════════════════════════════');
console.log('   VERIFICAÇÃO DO SISTEMA DE AUTOMAÇÃO');
console.log('═══════════════════════════════════════════\n');

let allGood = true;

// 1. Verificar sessão Prodesp
const sessionFile = path.join(__dirname, 'prodesp-session.json');
if (fs.existsSync(sessionFile)) {
  console.log('✅ Sessão Prodesp salva');
} else {
  console.log('❌ Sessão Prodesp NÃO encontrada');
  console.log('   Execute: node prodesp-save-session.js\n');
  allGood = false;
}

// 2. Verificar feriados
const holidaysFile = path.join(__dirname, 'holidays.json');
if (fs.existsSync(holidaysFile)) {
  const holidays = JSON.parse(fs.readFileSync(holidaysFile, 'utf-8'));
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  if (holidays[currentYear]) {
    console.log(`✅ Feriados ${currentYear} cadastrados`);
  } else {
    console.log(`⚠️  Feriados ${currentYear} não encontrados`);
  }

  if (holidays[nextYear]) {
    console.log(`✅ Feriados ${nextYear} cadastrados`);
  } else {
    console.log(`⚠️  Feriados ${nextYear} não encontrados (adicione antes do fim do ano)`);
  }
} else {
  console.log('❌ Arquivo de feriados NÃO encontrado\n');
  allGood = false;
}

// 3. Verificar se amanhã é dia útil
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);
const tomorrowCheck = isWorkday(tomorrow);

console.log(`\n📅 Amanhã: ${tomorrowStr}`);
if (tomorrowCheck.isWorkday) {
  console.log('✅ É DIA ÚTIL - Script vai executar normalmente');
} else {
  console.log(`⚠️  NÃO é dia útil - ${tomorrowCheck.reason}`);
  if (tomorrowCheck.dayName) console.log(`   ${tomorrowCheck.dayName}`);
  if (tomorrowCheck.holiday) console.log(`   ${tomorrowCheck.holiday} (${tomorrowCheck.type})`);
}

// 4. Verificar hoje
const today = new Date();
const todayStr = formatDate(today);
const todayCheck = isWorkday(today);

console.log(`\n📅 Hoje: ${todayStr}`);
if (todayCheck.isWorkday) {
  console.log('✅ É DIA ÚTIL');
} else {
  console.log(`❌ NÃO é dia útil - ${todayCheck.reason}`);
  if (todayCheck.dayName) console.log(`   ${todayCheck.dayName}`);
  if (todayCheck.holiday) console.log(`   ${todayCheck.holiday} (${todayCheck.type})`);
}

// 5. Verificar scripts principais
const scripts = [
  'daily-timesheet.js',
  'prodesp-with-session.js',
  'montreal-complete.js',
  'checkWorkday.js'
];

console.log('\n📄 Scripts principais:');
for (const script of scripts) {
  if (fs.existsSync(path.join(__dirname, script))) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script} NÃO encontrado`);
    allGood = false;
  }
}

// Resumo final
console.log('\n═══════════════════════════════════════════');
if (allGood && tomorrowCheck.isWorkday) {
  console.log('✅ SISTEMA PRONTO PARA USO!');
  console.log('\n📌 Próximos passos:');
  console.log('   1. Configure cron job ou agendador');
  console.log('   2. Teste manual: node daily-timesheet.js');
  console.log('   3. Monitore logs na primeira execução\n');
} else if (!tomorrowCheck.isWorkday) {
  console.log('⚠️  Sistema OK, mas amanhã não é dia útil');
  console.log('   Script não executará automaticamente\n');
} else {
  console.log('❌ AÇÃO NECESSÁRIA');
  console.log('   Corrija os problemas acima antes de usar\n');
}
console.log('═══════════════════════════════════════════\n');
