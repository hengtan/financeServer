/**
 * Verificação Completa de Pré-requisitos
 *
 * Verifica tudo antes de executar:
 * - Node.js instalado
 * - Playwright instalado
 * - Arquivos necessários
 * - Configurações válidas
 * - Sessão ativa
 * - Dia útil
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('./logger');

const REQUIRED_FILES = [
  'config.json',
  'holidays.json',
  'checkWorkday.js',
  'logger.js',
  'daily-timesheet.js',
  'prodesp-with-session.js',
  'montreal-complete.js'
];

const REQUIRED_DIRS = [
  'logs'
];

class SystemVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  /**
   * Executa todas as verificações
   */
  async verify() {
    logger.info('═══════════════════════════════════════════');
    logger.info('   VERIFICAÇÃO DE PRÉ-REQUISITOS');
    logger.info('═══════════════════════════════════════════\n');

    await this.checkNodeJS();
    await this.checkPlaywright();
    await this.checkFiles();
    await this.checkDirectories();
    await this.checkConfig();
    await this.checkSession();
    await this.checkHolidays();

    return this.generateReport();
  }

  /**
   * Verifica Node.js
   */
  async checkNodeJS() {
    try {
      const version = execSync('node --version', { encoding: 'utf-8' }).trim();
      const major = parseInt(version.split('.')[0].replace('v', ''));

      if (major >= 16) {
        this.addCheck('Node.js', true, `Versão ${version}`);
      } else {
        this.addError('Node.js versão muito antiga', `Requer v16+, encontrado ${version}`);
      }
    } catch (err) {
      this.addError('Node.js não encontrado', 'Instale Node.js v16 ou superior');
    }
  }

  /**
   * Verifica Playwright
   */
  async checkPlaywright() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

      if (packageJson.dependencies && packageJson.dependencies.playwright) {
        this.addCheck('Playwright (package.json)', true, packageJson.dependencies.playwright);

        // Verificar se está instalado
        const playwrightPath = path.join(__dirname, 'node_modules', 'playwright');
        if (fs.existsSync(playwrightPath)) {
          this.addCheck('Playwright (instalado)', true);
        } else {
          this.addWarning('Playwright não instalado', 'Execute: npm install');
        }
      } else {
        this.addError('Playwright não listado em package.json');
      }
    } catch (err) {
      this.addError('Erro ao verificar Playwright', err.message);
    }
  }

  /**
   * Verifica arquivos necessários
   */
  async checkFiles() {
    for (const file of REQUIRED_FILES) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        this.addCheck(`Arquivo: ${file}`, true);
      } else {
        this.addError(`Arquivo não encontrado: ${file}`);
      }
    }
  }

  /**
   * Verifica diretórios necessários
   */
  async checkDirectories() {
    for (const dir of REQUIRED_DIRS) {
      const dirPath = path.join(__dirname, dir);
      if (fs.existsSync(dirPath)) {
        this.addCheck(`Diretório: ${dir}`, true);
      } else {
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          this.addCheck(`Diretório: ${dir}`, true, 'Criado automaticamente');
        } catch (err) {
          this.addError(`Erro ao criar diretório ${dir}`, err.message);
        }
      }
    }
  }

  /**
   * Verifica configurações
   */
  async checkConfig() {
    try {
      const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

      // Verificar campos obrigatórios
      const required = ['system', 'schedule', 'credentials', 'workHours'];
      for (const field of required) {
        if (config[field]) {
          this.addCheck(`Config: ${field}`, true);
        } else {
          this.addError(`Campo obrigatório ausente em config.json: ${field}`);
        }
      }

      // Verificar se sistema está habilitado
      if (config.system && config.system.enabled === false) {
        this.addWarning('Sistema DESABILITADO em config.json', 'system.enabled = false');
      }

      // Verificar skip today
      if (config.system && config.system.skipToday === true) {
        this.addWarning('SKIP TODAY ATIVADO', 'Execução será pulada hoje');
      }

    } catch (err) {
      this.addError('Erro ao ler config.json', err.message);
    }
  }

  /**
   * Verifica sessão salva
   */
  async checkSession() {
    const sessionFile = path.join(__dirname, 'prodesp-session.json');
    if (fs.existsSync(sessionFile)) {
      try {
        const session = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
        if (session.cookies && session.cookies.length > 0) {
          this.addCheck('Sessão Prodesp', true, `${session.cookies.length} cookies salvos`);
        } else {
          this.addWarning('Sessão Prodesp sem cookies', 'Pode estar expirada');
        }
      } catch (err) {
        this.addError('Erro ao ler sessão', err.message);
      }
    } else {
      this.addError('Sessão Prodesp não encontrada', 'Execute: node prodesp-save-session.js');
    }
  }

  /**
   * Verifica feriados
   */
  async checkHolidays() {
    try {
      const holidays = JSON.parse(fs.readFileSync(path.join(__dirname, 'holidays.json'), 'utf-8'));
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      if (holidays[currentYear]) {
        const total = (holidays[currentYear].nacional?.length || 0) +
                     (holidays[currentYear].estadual?.length || 0) +
                     (holidays[currentYear].manual?.length || 0);
        this.addCheck(`Feriados ${currentYear}`, true, `${total} cadastrados`);
      } else {
        this.addError(`Feriados ${currentYear} não cadastrados`);
      }

      if (holidays[nextYear]) {
        this.addCheck(`Feriados ${nextYear}`, true);
      } else {
        this.addWarning(`Feriados ${nextYear} não cadastrados`, 'Adicione antes do fim do ano');
      }

    } catch (err) {
      this.addError('Erro ao ler feriados', err.message);
    }
  }

  /**
   * Adiciona check de sucesso
   */
  addCheck(name, success, detail = '') {
    this.checks.push({ name, success, detail });
    logger.success(`✅ ${name}${detail ? ': ' + detail : ''}`);
  }

  /**
   * Adiciona erro
   */
  addError(message, detail = '') {
    this.errors.push({ message, detail });
    logger.error(`❌ ${message}${detail ? ': ' + detail : ''}`);
  }

  /**
   * Adiciona warning
   */
  addWarning(message, detail = '') {
    this.warnings.push({ message, detail });
    logger.warn(`⚠️  ${message}${detail ? ': ' + detail : ''}`);
  }

  /**
   * Gera relatório final
   */
  generateReport() {
    logger.info('\n═══════════════════════════════════════════');
    logger.info('   RESULTADO DA VERIFICAÇÃO');
    logger.info('═══════════════════════════════════════════\n');

    logger.info(`✅ Checks: ${this.checks.length}`);
    logger.warn(`⚠️  Warnings: ${this.warnings.length}`);
    logger.error(`❌ Erros: ${this.errors.length}\n`);

    if (this.errors.length === 0) {
      logger.success('✅ SISTEMA PRONTO PARA USO!\n');
      return { success: true, errors: [], warnings: this.warnings };
    } else {
      logger.error('❌ CORRIJA OS ERROS ANTES DE CONTINUAR\n');
      logger.info('Erros encontrados:');
      this.errors.forEach((err, i) => {
        logger.error(`${i + 1}. ${err.message}${err.detail ? ': ' + err.detail : ''}`);
      });
      logger.info('');
      return { success: false, errors: this.errors, warnings: this.warnings };
    }
  }
}

// Se executado diretamente
if (require.main === module) {
  const verifier = new SystemVerifier();
  verifier.verify().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = SystemVerifier;
