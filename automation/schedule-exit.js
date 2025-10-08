/**
 * Agendador Inteligente de Saída
 *
 * Executa às 17h:
 * 1. Lê horário REAL de entrada na Prodesp
 * 2. Calcula saída: entrada + 8h trabalho + 1h almoço = 9h total
 * 3. Se passar de 18:05, limita a 18:05
 * 4. Cria tarefa agendada para o horário exato
 * 5. Tarefa executa: Finaliza atividade + Atualiza Montreal + Envia email
 */

const ExitTimeVerifier = require('./verify-exit-time');
const { execSync } = require('child_process');
const path = require('path');
const logger = require('./logger');

const NODE_PATH = process.execPath;
const SCRIPT_DIR = __dirname;

class ExitScheduler {
  async scheduleExit() {
    logger.info('═══════════════════════════════════════════');
    logger.info('  AGENDADOR INTELIGENTE DE SAÍDA');
    logger.info('═══════════════════════════════════════════\n');

    // 1. Verificar horário de entrada
    const verifier = new ExitTimeVerifier();
    const verification = await verifier.verify();

    if (!verification.entryTime) {
      logger.warn('❌ Entrada ainda não registrada. Nada a fazer.\n');
      return;
    }

    logger.success(`✅ Entrada detectada: ${verification.entryTime}`);
    logger.success(`✅ Saída calculada: ${verification.exitTime}\n`);

    // 2. Determinar horário de execução
    let scheduledTime = verification.exitTime;
    const [exitHours, exitMinutes] = verification.exitTime.split(':').map(Number);

    // Se passar de 18:05, limita a 18:05
    if (exitHours > 18 || (exitHours === 18 && exitMinutes > 5)) {
      scheduledTime = '18:05';
      logger.warn(`⚠️  Saída calculada (${verification.exitTime}) passa de 18:05`);
      logger.info(`   Limitando horário para 18:05\n`);
    }

    logger.info(`📅 Horário agendado para batida de saída: ${scheduledTime}\n`);

    // 3. Criar tarefa agendada para HOJE
    this.createOnceTask(scheduledTime);

    logger.info('═══════════════════════════════════════════\n');
  }

  createOnceTask(time) {
    const taskName = 'Ponto Automático - Saída Hoje';

    logger.step(1, `Criando tarefa agendada para ${time}`);

    try {
      // Deletar tarefa se já existir
      try {
        execSync(`schtasks /Delete /TN "${taskName}" /F`, { stdio: 'pipe' });
        logger.info('   ⚠️  Tarefa anterior removida');
      } catch (e) {
        // Não existe, tudo bem
      }

      const today = new Date();
      const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

      // Criar tarefa que executa HOJE às X horas
      // /RU SYSTEM = Roda mesmo com usuário deslogado
      // /RL HIGHEST = Privilégios elevados
      const command = `schtasks /Create /TN "${taskName}" /TR "\\"${NODE_PATH}\\" \\"${path.join(SCRIPT_DIR, 'run-timesheet.js')}\\"" /SC ONCE /SD ${dateStr} /ST ${time} /RU SYSTEM /RL HIGHEST /F`;

      execSync(command, { stdio: 'inherit' });

      logger.success(`✅ Tarefa criada com sucesso!`);
      logger.info(`   Nome: ${taskName}`);
      logger.info(`   Horário: Hoje às ${time}`);
      logger.info(`   Executa: Mesmo com Windows bloqueado\n`);

      logger.info('💡 A tarefa executará automaticamente e:');
      logger.info('   1. Verificará se está no horário correto (±5min)');
      logger.info('   2. Baterá saída na Prodesp');
      logger.info('   3. Atualizará Montreal');
      logger.info('   4. Enviará email de confirmação\n');

    } catch (error) {
      logger.error(`❌ Erro ao criar tarefa agendada`);
      logger.error(`   ${error.message}\n`);

      logger.warn('⚠️  Tentando criar sem /RU SYSTEM...');

      try {
        // Tentar sem SYSTEM (vai pedir senha ou rodar com usuário atual)
        const fallbackCommand = `schtasks /Create /TN "${taskName}" /TR "\\"${NODE_PATH}\\" \\"${path.join(SCRIPT_DIR, 'run-timesheet.js')}\\"" /SC ONCE /SD ${dateStr} /ST ${time} /F`;
        execSync(fallbackCommand, { stdio: 'inherit' });

        logger.success('✅ Tarefa criada (modo usuário)');
        logger.warn('⚠️  Requer usuário logado para executar\n');
      } catch (e2) {
        logger.error(`❌ Falha total ao criar tarefa: ${e2.message}\n`);
      }
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const scheduler = new ExitScheduler();
  scheduler.scheduleExit().then(() => {
    console.log('✅ Agendamento concluído!\n');
  });
}

module.exports = ExitScheduler;
