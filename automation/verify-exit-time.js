/**
 * Verificador Inteligente de Horário de Saída
 *
 * Lê o horário REAL de entrada na Prodesp e calcula quando deve bater saída
 * Entrada + 9h trabalho + 1h almoço = Hora de sair
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const CONFIG_FILE = path.join(__dirname, 'config.json');
const SESSION_FILE = path.join(__dirname, 'prodesp-session.json');
const TIMES_FILE = path.join(__dirname, 'daily-times.json');

class ExitTimeVerifier {
  constructor() {
    this.config = null;
    this.realEntryTime = null;
    this.calculatedExitTime = null;
  }

  /**
   * Carrega configuração
   */
  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return true;
    } catch (err) {
      logger.error('Erro ao carregar config.json', { error: err.message });
      return false;
    }
  }

  /**
   * Lê o horário REAL de entrada na Prodesp
   */
  async getRealEntryTime() {
    const browser = await chromium.launch({ headless: false, slowMo: 600 });

    let context;
    if (fs.existsSync(SESSION_FILE)) {
      const sessionState = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      context = await browser.newContext({ storageState: sessionState });
    } else {
      context = await browser.newContext();
    }

    const page = await context.newPage();

    try {
      logger.step(1, 'Acessando Prodesp para verificar horário de entrada');

      await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
      await page.waitForTimeout(3000);

      // Verificar se precisa login
      const hasLoginFields = await page.locator('#txtUsuario').isVisible({ timeout: 3000 }).catch(() => false);

      if (hasLoginFields) {
        logger.step(2, 'Fazendo login Prodesp');
        await page.fill('#txtUsuario', this.config.credentials.prodesp.username);
        await page.fill('#txtSenha', this.config.credentials.prodesp.password);
        const entrarButton = await page.locator('input[type="submit"], input[type="button"][value*="Entrar"]').first();
        await entrarButton.click();
        await page.waitForTimeout(5000);
      }

      logger.step(3, 'Clicando em "Apontamento de Atividades"');

      // Clicar no botão de Atividades
      await page.click('#MainContent_btnTarefas');
      await page.waitForTimeout(3000);

      logger.step(4, 'Lendo horário real de entrada');

      // Verificar se o elemento existe
      const atividadeLabel = await page.locator('#MainContent_lblAtividade').textContent().catch(() => null);

      if (!atividadeLabel || !atividadeLabel.includes('Atividade Iniciada em:')) {
        logger.warn('Entrada ainda não foi registrada hoje');
        await browser.close();
        return null;
      }

      // Ler horário em MainContent_lblHora
      const fullDateTime = await page.locator('#MainContent_lblHora').textContent();

      // Formato: "06/10/2025 08:55:00"
      const match = fullDateTime.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);

      if (!match) {
        logger.error('Formato de horário inválido', { fullDateTime });
        await browser.close();
        return null;
      }

      const [_, date, hours, minutes, seconds] = match;

      this.realEntryTime = {
        full: fullDateTime,
        date: date,
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        time: `${hours}:${minutes}`
      };

      logger.success(`✅ Horário real de entrada: ${this.realEntryTime.time}`);

      await browser.close();
      return this.realEntryTime;

    } catch (error) {
      logger.error('Erro ao ler horário de entrada', { error: error.message, stack: error.stack });
      await browser.close();
      return null;
    }
  }

  /**
   * Calcula horário de saída
   * Entrada + 8h trabalho + 1h almoço = 9h total = Saída
   */
  calculateExitTime(entryTime) {
    const entryHours = entryTime.hours;
    const entryMinutes = entryTime.minutes;

    // Total de minutos desde meia-noite
    const entryTotalMinutes = entryHours * 60 + entryMinutes;

    // Adicionar 8h trabalho + 1h almoço = 9h total = 540 minutos
    const exitTotalMinutes = entryTotalMinutes + 540;

    const exitHours = Math.floor(exitTotalMinutes / 60);
    const exitMinutes = exitTotalMinutes % 60;

    this.calculatedExitTime = {
      hours: exitHours,
      minutes: exitMinutes,
      time: `${String(exitHours).padStart(2, '0')}:${String(exitMinutes).padStart(2, '0')}`
    };

    logger.info(`Horário calculado de saída: ${this.calculatedExitTime.time}`, {
      entrada: entryTime.time,
      calculo: 'entrada + 8h trabalho + 1h almoço = 9h total'
    });

    return this.calculatedExitTime;
  }

  /**
   * Verifica se está no momento de bater saída (±5min)
   */
  isTimeToClockOut() {
    if (!this.calculatedExitTime) {
      logger.error('Horário de saída não calculado');
      return false;
    }

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const exitTotalMinutes = this.calculatedExitTime.hours * 60 + this.calculatedExitTime.minutes;

    // Margem de ±5 minutos
    const diff = currentTotalMinutes - exitTotalMinutes;

    logger.info('Verificando se é hora de bater saída', {
      horaAtual: `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
      horarioSaida: this.calculatedExitTime.time,
      diferenca: `${diff} minutos`,
      tolerancia: '±5 minutos'
    });

    if (diff >= -5 && diff <= 5) {
      logger.success(`✅ Está no horário de bater saída! (diferença: ${diff}min)`);
      return true;
    } else if (diff < -5) {
      const minutosRestantes = Math.abs(diff);
      logger.warn(`⏰ Ainda faltam ${minutosRestantes} minutos para o horário de saída`);
      return false;
    } else {
      logger.warn(`⚠️ Passou ${diff} minutos do horário de saída!`);
      return true; // Bate mesmo se passou (dentro do razoável)
    }
  }

  /**
   * Atualiza arquivo de horários com o horário real de entrada
   */
  updateDailyTimesFile(entryTime, exitTime) {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      let data = {};

      if (fs.existsSync(TIMES_FILE)) {
        data = JSON.parse(fs.readFileSync(TIMES_FILE, 'utf-8'));
      }

      // Se já existe dados do dia, atualiza apenas a entrada real
      if (!data[dateStr]) {
        data[dateStr] = {};
      }

      data[dateStr].entryReal = entryTime.time;
      data[dateStr].exitCalculated = exitTime.time;

      fs.writeFileSync(TIMES_FILE, JSON.stringify(data, null, 2));
      logger.success('Arquivo daily-times.json atualizado com horário real');

    } catch (err) {
      logger.error('Erro ao atualizar daily-times.json', { error: err.message });
    }
  }

  /**
   * Executa verificação completa
   */
  async verify() {
    logger.info('═══════════════════════════════════════════');
    logger.info('  VERIFICAÇÃO DE HORÁRIO DE SAÍDA');
    logger.info('═══════════════════════════════════════════');

    if (!this.loadConfig()) {
      return { shouldClockOut: false, reason: 'Erro ao carregar configuração' };
    }

    // 1. Ler horário real de entrada
    const entryTime = await this.getRealEntryTime();

    if (!entryTime) {
      return { shouldClockOut: false, reason: 'Entrada ainda não registrada' };
    }

    // 2. Calcular horário de saída
    const exitTime = this.calculateExitTime(entryTime);

    // 3. Atualizar arquivo
    this.updateDailyTimesFile(entryTime, exitTime);

    // 4. Verificar se é hora de bater saída
    const shouldClockOut = this.isTimeToClockOut();

    logger.info('═══════════════════════════════════════════');

    return {
      shouldClockOut,
      entryTime: entryTime.time,
      exitTime: exitTime.time,
      reason: shouldClockOut ? 'Horário correto para bater saída' : 'Ainda não chegou a hora'
    };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const verifier = new ExitTimeVerifier();

  verifier.verify().then(result => {
    console.log('\n📊 Resultado da Verificação:');
    console.log(`   Entrada Real: ${result.entryTime || 'N/A'}`);
    console.log(`   Saída Calculada: ${result.exitTime || 'N/A'}`);
    console.log(`   Deve bater saída? ${result.shouldClockOut ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Motivo: ${result.reason}\n`);

    process.exit(result.shouldClockOut ? 0 : 1);
  });
}

module.exports = ExitTimeVerifier;
