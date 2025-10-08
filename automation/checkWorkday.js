/**
 * Módulo de Verificação de Dia Útil
 *
 * Verifica se uma data é dia útil considerando:
 * - Finais de semana (Sábado e Domingo)
 * - Feriados nacionais
 * - Feriados estaduais (SP)
 * - Feriados manuais personalizados
 */

const fs = require('fs');
const path = require('path');

const HOLIDAYS_FILE = path.join(__dirname, 'holidays.json');

/**
 * Verifica se é final de semana
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
}

/**
 * Formata data para string YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Carrega feriados do arquivo JSON
 */
function loadHolidays() {
  if (!fs.existsSync(HOLIDAYS_FILE)) {
    console.error('❌ Arquivo holidays.json não encontrado!');
    return {};
  }
  return JSON.parse(fs.readFileSync(HOLIDAYS_FILE, 'utf-8'));
}

/**
 * Verifica se é feriado
 */
function isHoliday(date) {
  const holidays = loadHolidays();
  const year = date.getFullYear().toString();
  const dateStr = formatDate(date);

  if (!holidays[year]) {
    return { isHoliday: false };
  }

  // Verificar feriados nacionais
  for (const holiday of holidays[year].nacional || []) {
    if (holiday.date === dateStr) {
      return { isHoliday: true, name: holiday.name, type: 'Nacional' };
    }
  }

  // Verificar feriados estaduais
  for (const holiday of holidays[year].estadual || []) {
    if (holiday.date === dateStr) {
      return { isHoliday: true, name: holiday.name, type: 'Estadual (SP)' };
    }
  }

  // Verificar feriados manuais
  for (const holiday of holidays[year].manual || []) {
    if (holiday.date === dateStr) {
      return { isHoliday: true, name: holiday.name, type: 'Manual' };
    }
  }

  return { isHoliday: false };
}

/**
 * Verifica se é dia útil (não é fim de semana nem feriado)
 */
function isWorkday(date = new Date()) {
  // Normalizar para meia-noite
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Verificar fim de semana
  if (isWeekend(checkDate)) {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return {
      isWorkday: false,
      reason: 'Final de semana',
      dayName: dayNames[checkDate.getDay()]
    };
  }

  // Verificar feriado
  const holidayCheck = isHoliday(checkDate);
  if (holidayCheck.isHoliday) {
    return {
      isWorkday: false,
      reason: 'Feriado',
      holiday: holidayCheck.name,
      type: holidayCheck.type
    };
  }

  return { isWorkday: true };
}

/**
 * Adicionar feriado manual
 */
function addManualHoliday(dateStr, name) {
  const holidays = loadHolidays();
  const year = dateStr.split('-')[0];

  if (!holidays[year]) {
    holidays[year] = { nacional: [], estadual: [], manual: [] };
  }

  if (!holidays[year].manual) {
    holidays[year].manual = [];
  }

  // Verificar se já existe
  const exists = holidays[year].manual.some(h => h.date === dateStr);
  if (exists) {
    console.log(`⚠️  Feriado ${dateStr} já existe`);
    return false;
  }

  holidays[year].manual.push({ date: dateStr, name });
  fs.writeFileSync(HOLIDAYS_FILE, JSON.stringify(holidays, null, 2));
  console.log(`✅ Feriado adicionado: ${dateStr} - ${name}`);
  return true;
}

/**
 * Remover feriado manual
 */
function removeManualHoliday(dateStr) {
  const holidays = loadHolidays();
  const year = dateStr.split('-')[0];

  if (!holidays[year] || !holidays[year].manual) {
    console.log('❌ Nenhum feriado manual encontrado para este ano');
    return false;
  }

  const initialLength = holidays[year].manual.length;
  holidays[year].manual = holidays[year].manual.filter(h => h.date !== dateStr);

  if (holidays[year].manual.length < initialLength) {
    fs.writeFileSync(HOLIDAYS_FILE, JSON.stringify(holidays, null, 2));
    console.log(`✅ Feriado removido: ${dateStr}`);
    return true;
  }

  console.log(`❌ Feriado ${dateStr} não encontrado`);
  return false;
}

/**
 * Listar todos os feriados de um ano
 */
function listHolidays(year = new Date().getFullYear()) {
  const holidays = loadHolidays();
  const yearStr = year.toString();

  if (!holidays[yearStr]) {
    console.log(`❌ Nenhum feriado cadastrado para ${year}`);
    return;
  }

  console.log(`\n📅 Feriados de ${year}:\n`);

  if (holidays[yearStr].nacional?.length > 0) {
    console.log('🇧🇷 Nacionais:');
    holidays[yearStr].nacional.forEach(h => {
      console.log(`   ${h.date} - ${h.name}`);
    });
    console.log('');
  }

  if (holidays[yearStr].estadual?.length > 0) {
    console.log('🏛️  Estaduais (SP):');
    holidays[yearStr].estadual.forEach(h => {
      console.log(`   ${h.date} - ${h.name}`);
    });
    console.log('');
  }

  if (holidays[yearStr].manual?.length > 0) {
    console.log('✏️  Manuais:');
    holidays[yearStr].manual.forEach(h => {
      console.log(`   ${h.date} - ${h.name}`);
    });
    console.log('');
  }
}

// Exportar funções
module.exports = {
  isWorkday,
  isWeekend,
  isHoliday,
  addManualHoliday,
  removeManualHoliday,
  listHolidays,
  formatDate
};

// Se executado diretamente, mostrar status do dia atual
if (require.main === module) {
  const today = new Date();
  const check = isWorkday(today);

  console.log('\n📅 Verificação de Dia Útil\n');
  console.log(`Data: ${formatDate(today)}`);

  if (check.isWorkday) {
    console.log('✅ É DIA ÚTIL - Scripts devem executar\n');
  } else {
    console.log(`❌ NÃO É DIA ÚTIL - ${check.reason}`);
    if (check.dayName) {
      console.log(`   ${check.dayName}`);
    }
    if (check.holiday) {
      console.log(`   ${check.holiday} (${check.type})`);
    }
    console.log('');
  }
}
