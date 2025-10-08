/**
 * SCRIPT PRINCIPAL - Automação Diária de Ponto
 *
 * REGRAS:
 * - Só executa em dias úteis (seg-sex, não feriados)
 * - ENTRADA: Só entre 8:50 e 9:05 (10min de tolerância)
 *   → Bate entrada na Prodesp (Iniciar Atividade)
 *   → Calcula horários aleatórios do dia:
 *     - Entrada: random 8:50-9:05
 *     - Almoço: random 12:20-12:30 (duração EXATA de 1h)
 *   → Salva em horarios-do-dia.txt
 * - Se não executou entrada, NÃO executa saída
 * - SAÍDA: Janela de verificação 17:00 - 19:00
 *   → Lê horário REAL de entrada na Prodesp
 *   → Calcula: entrada + 8h trabalho + 1h almoço = 9h total = hora de sair
 *   → Só bate saída se estiver no horário correto (±5min)
 *   → Bate saída na Prodesp (Finalizar Atividade)
 *   → Atualiza Montreal com horários do arquivo TXT
 * - Respeita flag skipToday em config.json
 * - Logs completos de tudo
 * - Envia email de notificação
 */

const { chromium } = require('playwright');
const { isWorkday, formatDate } = require('./checkWorkday');
const logger = require('./logger');
const SystemVerifier = require('./verify-system');
const EmailNotifier = require('./email-notifier');
const ExitTimeVerifier = require('./verify-exit-time');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'config.json');
const TIMES_FILE = path.join(__dirname, 'daily-times.json');
const TIMES_TXT_FILE = path.join(__dirname, 'horarios-do-dia.txt');
const SESSION_FILE = path.join(__dirname, 'prodesp-session.json');
const EXECUTION_LOG = path.join(__dirname, 'execution-log.json');

class TimesheetAutomation {
  constructor() {
    this.config = null;
    this.today = new Date();
    this.dateStr = formatDate(this.today);
    this.executionState = this.loadExecutionState();
    this.emailNotifier = new EmailNotifier();
  }

  /**
   * Carrega configuração
   */
  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      logger.info('Configuração carregada', this.config);
      return true;
    } catch (err) {
      logger.error('Erro ao carregar config.json', { error: err.message });
      return false;
    }
  }

  /**
   * Carrega estado de execução
   */
  loadExecutionState() {
    try {
      if (fs.existsSync(EXECUTION_LOG)) {
        return JSON.parse(fs.readFileSync(EXECUTION_LOG, 'utf-8'));
      }
    } catch (err) {
      logger.warn('Erro ao carregar execution-log.json', { error: err.message });
    }
    return {};
  }

  /**
   * Salva estado de execução
   */
  saveExecutionState() {
    try {
      fs.writeFileSync(EXECUTION_LOG, JSON.stringify(this.executionState, null, 2));
    } catch (err) {
      logger.error('Erro ao salvar execution-log.json', { error: err.message });
    }
  }

  /**
   * Marca execução
   */
  markExecution(type, status, details = {}) {
    if (!this.executionState[this.dateStr]) {
      this.executionState[this.dateStr] = {};
    }
    this.executionState[this.dateStr][type] = {
      status,
      timestamp: new Date().toISOString(),
      ...details
    };
    this.saveExecutionState();
  }

  /**
   * Verificar se já executou hoje
   */
  hasExecuted(type) {
    return this.executionState[this.dateStr] &&
           this.executionState[this.dateStr][type] &&
           this.executionState[this.dateStr][type].status === 'success';
  }

  /**
   * Verificar se é horário válido para execução
   */
  isValidTime(type) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    if (type === 'entry') {
      // Entre 8:50 e 9:05 (10 minutos de tolerância)
      const start = 8 * 60 + 50;  // 8:50
      const end = 9 * 60 + 5;     // 9:05

      if (currentTime < start) {
        logger.warn(`Muito cedo para entrada. Aguarde até 8:50 (agora: ${currentHour}:${String(currentMinute).padStart(2, '0')})`);
        return false;
      }
      if (currentTime > end) {
        logger.warn(`Muito tarde para entrada. Janela fechou às 9:05 (agora: ${currentHour}:${String(currentMinute).padStart(2, '0')})`);
        return false;
      }
      return true;

    } else if (type === 'exit') {
      // Janela de verificação: Entre 17:00 e 19:00
      const start = 17 * 60;       // 17:00
      const end = 19 * 60;         // 19:00

      if (currentTime < start) {
        logger.warn(`Muito cedo para verificar saída. Aguarde até 17:00 (agora: ${currentHour}:${String(currentMinute).padStart(2, '0')})`);
        return false;
      }
      if (currentTime > end) {
        logger.warn(`Muito tarde para saída. Janela fechou às 19:00 (agora: ${currentHour}:${String(currentMinute).padStart(2, '0')})`);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Calcular horários do dia
   * - Entrada: 8:50 - 9:05 (random)
   * - Almoço início: 12:20 - 12:30 (random)
   * - Almoço duração: EXATAMENTE 1h
   * - Saída: calculada para completar 8h de trabalho (9h total com almoço)
   */
  calculateDayTimes() {
    const { randomization, workHours } = this.config;

    // Entrada random entre 8:50 e 9:05
    const entry = this.randomTime(
      randomization.entryMinHour,
      randomization.entryMinMinute,
      randomization.entryMaxHour,
      randomization.entryMaxMinute
    );

    // Almoço início: random entre 12:20 e 12:30
    const lunchStart = this.randomTime(
      randomization.lunchStartMinHour,
      randomization.lunchStartMinMinute,
      randomization.lunchStartMaxHour,
      randomization.lunchStartMaxMinute
    );

    // Duração do almoço: EXATAMENTE 1h (60 minutos)
    const lunchDuration = 60;
    const lunchEnd = this.addMinutes(lunchStart, lunchDuration);

    // Calcular saída para completar 8h de trabalho (9h total com almoço)
    const [entryH, entryM] = entry.split(':').map(Number);
    const [lunchStartH, lunchStartM] = lunchStart.split(':').map(Number);
    const morningMinutes = (lunchStartH * 60 + lunchStartM) - (entryH * 60 + entryM);

    const afternoonMinutes = workHours.totalMinutes - morningMinutes;
    const exit = this.addMinutes(lunchEnd, afternoonMinutes);

    return {
      entry,
      lunchStart,
      lunchEnd,
      exit
    };
  }

  randomTime(minHour, minMinute, maxHour, maxMinute) {
    const minTotalMinutes = minHour * 60 + minMinute;
    const maxTotalMinutes = maxHour * 60 + maxMinute;
    const randomMinutes = Math.floor(Math.random() * (maxTotalMinutes - minTotalMinutes + 1)) + minTotalMinutes;

    const hours = Math.floor(randomMinutes / 60);
    const minutes = randomMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  addMinutes(time, minutes) {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Salvar horários (JSON + TXT)
   */
  saveDailyTimes(times) {
    // Salvar JSON
    let data = {};
    if (fs.existsSync(TIMES_FILE)) {
      data = JSON.parse(fs.readFileSync(TIMES_FILE, 'utf-8'));
    }
    data[this.dateStr] = times;
    fs.writeFileSync(TIMES_FILE, JSON.stringify(data, null, 2));

    // Salvar TXT legível
    const txtContent = `═══════════════════════════════════════════
HORÁRIOS DO DIA - ${this.dateStr}
═══════════════════════════════════════════

Entrada:        ${times.entry || 'N/A'}
Saída Almoço:   ${times.lunchStart || 'N/A'}
Volta Almoço:   ${times.lunchEnd || 'N/A'}
Saída Final:    ${times.exit || 'N/A'}

═══════════════════════════════════════════
Gerado automaticamente em: ${new Date().toLocaleString('pt-BR')}
═══════════════════════════════════════════
`;

    fs.writeFileSync(TIMES_TXT_FILE, txtContent);
    logger.info('Horários salvos (JSON + TXT)', times);
  }

  /**
   * Carregar horários
   */
  loadDailyTimes() {
    if (!fs.existsSync(TIMES_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(TIMES_FILE, 'utf-8'));
    return data[this.dateStr] || null;
  }

  /**
   * Batida de ponto Prodesp
   */
  async clockInProdesp(type) {
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
      logger.step(1, `Batida ${type === 'entry' ? 'ENTRADA' : 'SAÍDA'} - Acessando Prodesp`);

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

      logger.step(3, 'Clicando em Atividades');
      await page.click('#MainContent_btnTarefas');
      await page.waitForTimeout(3000);

      logger.step(4, 'Selecionando "Atividades de Desenvolvimento"');
      await page.selectOption('#MainContent_ddlAtividade', '54');
      await page.waitForTimeout(2000);

      if (type === 'entry') {
        logger.step(5, 'Clicando em "Iniciar Atividade"');
        await page.click('#MainContent_btnIniciar');
      } else {
        logger.step(5, 'Clicando em "Finalizar Atividade"');
        await page.click('#MainContent_btnFinalizar');
      }
      await page.waitForTimeout(3000);

      logger.success(`✅ Ponto ${type === 'entry' ? 'ENTRADA' : 'SAÍDA'} registrado com sucesso!`);

      await page.waitForTimeout(5000);
      return true;

    } catch (error) {
      logger.error(`Erro ao bater ponto ${type}`, { error: error.message, stack: error.stack });
      return false;
    } finally {
      await browser.close();
    }
  }

  /**
   * Atualizar Montreal
   */
  async updateMontreal(times) {
    const browser = await chromium.launch({ headless: false, slowMo: 600 });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      logger.step(1, 'Atualizando Montreal - Login');

      await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
      await page.fill('#txtUser', this.config.credentials.montreal.username);
      await page.fill('#txtPass', this.config.credentials.montreal.password);
      await page.click('#btnLogin');
      await page.waitForTimeout(3000);

      logger.step(2, 'Navegando para Espelho do Cartão');
      await page.click('#ctl18_REC_PtoEspCartaoActionWeb_LinkControl');
      await page.waitForTimeout(2000);

      await page.click('#ctl26_ctl01_ctl01');
      await page.waitForTimeout(1000);

      logger.step(3, 'Abrindo Entrada de Batidas');
      await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
      await page.waitForTimeout(3000);

      const pages = context.pages();
      const newPage = pages[pages.length - 1];

      await newPage.fill('#GB_txtJustificativa', 'Atualizacao do Ponto');

      // Procurar linha da data
      const dateSpans = await newPage.locator('span[id^="GB_l"][id$="_lblData"]').all();
      let rowIndex = null;

      const dateFormatted = this.dateStr.split('-').reverse().join('/');

      for (let i = 0; i < dateSpans.length; i++) {
        const dateText = await dateSpans[i].textContent();
        const id = await dateSpans[i].getAttribute('id');

        if (dateText === dateFormatted) {
          const match = id.match(/GB_l(\d+)_lblData/);
          if (match) {
            rowIndex = match[1];
            break;
          }
        }
      }

      if (rowIndex) {
        logger.step(4, `Preenchendo horários para ${dateFormatted}`);

        await newPage.fill(`#GB_l${rowIndex}_txtEnt1`, times.entry);
        await newPage.fill(`#GB_l${rowIndex}_txtSai1`, times.lunchStart);
        await newPage.fill(`#GB_l${rowIndex}_txtEnt2`, times.lunchEnd);
        await newPage.fill(`#GB_l${rowIndex}_txtSai2`, times.exit);

        logger.info(`Ent1: ${times.entry} | Sai1: ${times.lunchStart} | Ent2: ${times.lunchEnd} | Sai2: ${times.exit}`);

        logger.step(5, 'Salvando');
        await newPage.click('#GB_btnSalvar_tblabel');
        await newPage.waitForTimeout(3000);

        await newPage.close();
        await page.waitForTimeout(1000);

        logger.step(6, 'Atualizando');
        await page.click('#ctl26_btnAtualizar_tblabel');
        await page.waitForTimeout(3000);

        logger.success('✅ Montreal atualizado com sucesso!');
        return true;

      } else {
        logger.error('Data não encontrada na tabela Montreal');
        return false;
      }

    } catch (error) {
      logger.error('Erro ao atualizar Montreal', { error: error.message, stack: error.stack });
      return false;
    } finally {
      await browser.close();
    }
  }

  /**
   * Executar fluxo principal
   */
  async run() {
    logger.info('═══════════════════════════════════════════');
    logger.info('   AUTOMAÇÃO DIÁRIA DE PONTO');
    logger.info('═══════════════════════════════════════════\n');
    logger.info(`Data: ${this.dateStr}\n`);

    // 1. Carregar configuração
    logger.step(1, 'Carregando configuração');
    if (!this.loadConfig()) {
      logger.error('Falha ao carregar configuração. Abortando.');
      return;
    }

    // 2. Verificar se sistema está habilitado
    if (!this.config.system.enabled) {
      logger.warn('⚠️  SISTEMA DESABILITADO em config.json');
      logger.info('Para habilitar, altere system.enabled para true\n');
      return;
    }

    // 3. Verificar skip today
    if (this.config.system.skipToday) {
      logger.warn('⚠️  SKIP TODAY ATIVO - Execução cancelada');
      logger.info('Para executar, altere system.skipToday para false em config.json\n');
      return;
    }

    // 4. Verificar pré-requisitos
    logger.step(2, 'Verificando pré-requisitos');
    const verifier = new SystemVerifier();
    const verification = await verifier.verify();

    if (!verification.success) {
      logger.error('Verificação falhou. Corrija os erros antes de continuar.\n');
      return;
    }

    // 5. Verificar se é dia útil
    logger.step(3, 'Verificando se é dia útil');
    const workdayCheck = isWorkday(this.today);

    if (!workdayCheck.isWorkday) {
      logger.warn(`NÃO É DIA ÚTIL - ${workdayCheck.reason}`);
      if (workdayCheck.dayName) logger.info(`${workdayCheck.dayName}`);
      if (workdayCheck.holiday) logger.info(`${workdayCheck.holiday} (${workdayCheck.type})`);
      logger.info('\nScript não será executado.\n');
      return;
    }

    logger.success('É DIA ÚTIL - Prosseguindo\n');

    // 6. Calcular ou carregar horários
    logger.step(4, 'Calculando horários do dia');
    let times = this.loadDailyTimes();

    if (!times) {
      times = this.calculateDayTimes();
      this.saveDailyTimes(times);
      logger.info('Horários calculados:', times);
    } else {
      logger.info('Horários já existentes:', times);
    }

    // 7. Determinar ação baseada no horário
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    logger.info(`\nHora atual: ${currentHour}:${String(currentMinute).padStart(2, '0')}\n`);

    // ENTRADA
    if (!this.hasExecuted('entry') && this.isValidTime('entry')) {
      logger.step(5, 'EXECUTANDO: Batida de ENTRADA');

      const success = await this.clockInProdesp('entry');

      if (success) {
        this.markExecution('entry', 'success', { time: times.entry });
        logger.success('✅ Entrada registrada com sucesso!\n');

        // Enviar email de notificação
        if (this.emailNotifier.initialize()) {
          await this.emailNotifier.sendSuccess('entry', { times });
        }
      } else {
        this.markExecution('entry', 'failed');
        logger.error('❌ Falha ao registrar entrada\n');

        // Enviar email de erro
        if (this.emailNotifier.initialize()) {
          await this.emailNotifier.sendError('Batida de entrada', 'Falha ao registrar entrada na Prodesp');
        }
      }

      return;
    }

    // SAÍDA (só se entrada foi feita)
    if (this.hasExecuted('entry') && !this.hasExecuted('exit') && this.isValidTime('exit')) {
      logger.step(5, 'VERIFICANDO horário real antes da saída');

      // Verificar horário real de entrada e calcular saída correta
      const exitVerifier = new ExitTimeVerifier();
      const verification = await exitVerifier.verify();

      if (!verification.shouldClockOut) {
        logger.warn(`❌ Ainda não é hora de bater saída: ${verification.reason}`);
        logger.info(`   Entrada real: ${verification.entryTime || 'N/A'}`);
        logger.info(`   Saída calculada: ${verification.exitTime || 'N/A'}\n`);
        return;
      }

      logger.success(`✅ Horário correto para bater saída!`);
      logger.info(`   Entrada real: ${verification.entryTime}`);
      logger.info(`   Saída calculada: ${verification.exitTime}\n`);

      // Atualizar times com horários reais
      times.entryReal = verification.entryTime;
      times.exitReal = verification.exitTime;

      logger.step(6, 'EXECUTANDO: Batida de SAÍDA');

      const success = await this.clockInProdesp('exit');

      if (success) {
        this.markExecution('exit', 'success', { time: times.exit });

        // Atualizar Montreal
        logger.step(7, 'EXECUTANDO: Atualização Montreal');
        const montrealSuccess = await this.updateMontreal(times);

        if (montrealSuccess) {
          this.markExecution('montreal', 'success');
          logger.success('\n✅ PROCESSO COMPLETO!\n');
          logger.info('Resumo:');
          logger.info(`  Entrada: ${times.entry}`);
          logger.info(`  Almoço: ${times.lunchStart} - ${times.lunchEnd}`);
          logger.info(`  Saída: ${times.exit}\n`);

          // Enviar email de sucesso completo
          if (this.emailNotifier.initialize()) {
            await this.emailNotifier.sendSuccess('exit', { times });
          }
        } else {
          this.markExecution('montreal', 'failed');
          logger.error('❌ Falha ao atualizar Montreal\n');

          // Enviar email de erro
          if (this.emailNotifier.initialize()) {
            await this.emailNotifier.sendError('Atualização Montreal', 'Falha ao atualizar Montreal após batida de saída');
          }
        }
      } else {
        this.markExecution('exit', 'failed');
        logger.error('❌ Falha ao registrar saída\n');

        // Enviar email de erro
        if (this.emailNotifier.initialize()) {
          await this.emailNotifier.sendError('Batida de saída', 'Falha ao registrar saída na Prodesp');
        }
      }

      return;
    }

    // Nenhuma ação necessária
    if (!this.hasExecuted('entry')) {
      logger.warn('Entrada ainda não foi executada.');
      logger.info('Janela de entrada: 8:50 - 9:05\n');
    } else if (!this.hasExecuted('exit')) {
      logger.info('Entrada já executada. Aguardando horário de saída.');
      logger.info('Janela de verificação: 17:00 - 19:00');
      logger.info('(O sistema verifica o horário real e calcula quando bater saída)\n');
    } else {
      logger.success('Todas as tarefas do dia já foram executadas!\n');
    }
  }
}

// Executar
const automation = new TimesheetAutomation();
automation.run().then(() => {
  logger.info('Script finalizado.\n');
}).catch(err => {
  logger.error('Erro fatal', { error: err.message, stack: err.stack });
  process.exit(1);
});
