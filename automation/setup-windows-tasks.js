/**
 * Setup Automático - Windows Task Scheduler
 *
 * Cria automaticamente as tarefas agendadas no Windows
 */

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const SCRIPT_DIR = __dirname;
const NODE_PATH = process.execPath; // Caminho do node.exe

console.log('═══════════════════════════════════════════');
console.log('   CONFIGURAÇÃO DE TAREFAS AGENDADAS');
console.log('   Windows Task Scheduler');
console.log('═══════════════════════════════════════════\n');

console.log(`📂 Diretório: ${SCRIPT_DIR}`);
console.log(`📦 Node.js: ${NODE_PATH}\n`);

// Verificar se está rodando no Windows
if (os.platform() !== 'win32') {
  console.log('❌ Este script é apenas para Windows!');
  console.log('   Para Mac/Linux, use crontab (veja README.md)\n');
  process.exit(1);
}

function createTask(name, time, description) {
  console.log(`\n📝 Criando tarefa: ${name}`);
  console.log(`   Horário: ${time}`);
  console.log(`   Descrição: ${description}\n`);

  try {
    // Deletar tarefa se já existir
    try {
      execSync(`schtasks /Delete /TN "${name}" /F`, { stdio: 'pipe' });
      console.log('   ⚠️  Tarefa existente removida');
    } catch (e) {
      // Não existe, tudo bem
    }

    // Criar tarefa com /RU SYSTEM para rodar mesmo bloqueado
    const command = `schtasks /Create /TN "${name}" /TR "\\"${NODE_PATH}\\" \\"${path.join(SCRIPT_DIR, 'run-timesheet.js')}\\"" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST ${time} /RU SYSTEM /RL HIGHEST /F`;

    try {
      execSync(command, { stdio: 'inherit' });
      console.log(`   ✅ Tarefa "${name}" criada com /RU SYSTEM (roda mesmo bloqueado)`);
      return true;
    } catch (e) {
      // Tentar sem /RU SYSTEM
      const fallbackCommand = `schtasks /Create /TN "${name}" /TR "\\"${NODE_PATH}\\" \\"${path.join(SCRIPT_DIR, 'run-timesheet.js')}\\"" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST ${time} /F`;
      execSync(fallbackCommand, { stdio: 'inherit' });
      console.log(`   ⚠️  Tarefa "${name}" criada em modo usuário (requer login)`);
      return true;
    }
  } catch (error) {
    console.error(`   ❌ Erro ao criar tarefa "${name}"`);
    console.error(`   ${error.message}`);
    return false;
  }
}

// Criar tarefas
console.log('Criando tarefas agendadas...\n');

const task1 = createTask(
  'Ponto Automático - Entrada',
  '08:50',
  'Batida de entrada Prodesp (8:50 seg-sex)'
);

const task2 = createTask(
  'Ponto Automático - Agendar Saída',
  '17:00',
  'Verifica entrada e agenda saída no horário correto (17:00 seg-sex)'
);

// Atualizar comando da tarefa 2 para executar schedule-exit.js
try {
  execSync(`schtasks /Delete /TN "Ponto Automático - Agendar Saída" /F`, { stdio: 'pipe' });
} catch (e) {}

const scheduleCommand = `schtasks /Create /TN "Ponto Automático - Agendar Saída" /TR "\\"${NODE_PATH}\\" \\"${path.join(SCRIPT_DIR, 'schedule-exit.js')}\\"" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 17:00 /RU SYSTEM /RL HIGHEST /F`;

try {
  execSync(scheduleCommand, { stdio: 'inherit' });
  console.log('   ✅ Tarefa criada com /RU SYSTEM (roda mesmo bloqueado)');
} catch (e) {
  // Tentar sem /RU SYSTEM
  const fallbackCommand = `schtasks /Create /TN "Ponto Automático - Agendar Saída" /TR "\\"${NODE_PATH}\\" \\"${path.join(SCRIPT_DIR, 'schedule-exit.js')}\\"" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 17:00 /F`;
  try {
    execSync(fallbackCommand, { stdio: 'inherit' });
    console.log('   ⚠️  Tarefa criada em modo usuário (requer login)');
  } catch (e2) {
    console.error('   ❌ Erro ao criar tarefa de agendamento');
  }
}

// Resumo
console.log('\n═══════════════════════════════════════════');
console.log('   RESUMO');
console.log('═══════════════════════════════════════════\n');

if (task1 && task2) {
  console.log('✅ TAREFAS CRIADAS COM SUCESSO!\n');
  console.log('Tarefas agendadas:');
  console.log('  📍 Entrada: Segunda a Sexta, 8:50');
  console.log('      → Bate entrada na Prodesp');
  console.log('\n  📍 Verificação de Saída: Segunda a Sexta, 17:00');
  console.log('      → Lê horário REAL de entrada no site da Prodesp');
  console.log('      → Calcula: entrada + 8h trabalho + 1h almoço = saída (9h total)');
  console.log('      → Agenda tarefa para o horário exato (máx 18:05)');
  console.log('      → Tarefa executa:');
  console.log('         • Finaliza atividade na Prodesp');
  console.log('         • Atualiza Montreal com horários do arquivo TXT');
  console.log('         • Envia email de confirmação\n');
  console.log('  ✅ Funciona mesmo com Windows bloqueado!\n');

  console.log('📋 Para visualizar as tarefas:');
  console.log('   1. Abra "Task Scheduler" (Agendador de Tarefas)');
  console.log('   2. Procure por "Ponto Automático"\n');

  console.log('🧪 Para testar manualmente:');
  console.log('   schtasks /Run /TN "Ponto Automático - Entrada"\n');

  console.log('⏸️  Para desabilitar temporariamente:');
  console.log('   Edite config.json e mude skipToday para true\n');

  console.log('🗑️  Para remover as tarefas:');
  console.log('   schtasks /Delete /TN "Ponto Automático - Entrada" /F');
  console.log('   schtasks /Delete /TN "Ponto Automático - Agendar Saída" /F');
  console.log('   schtasks /Delete /TN "Ponto Automático - Saída Hoje" /F\n');

} else {
  console.log('❌ ERRO ao criar algumas tarefas\n');
  console.log('Tente executar como Administrador:\n');
  console.log('   1. Clique direito em PowerShell');
  console.log('   2. "Executar como Administrador"');
  console.log('   3. Execute novamente este script\n');
}

console.log('═══════════════════════════════════════════\n');
