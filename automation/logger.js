/**
 * Sistema de Logging Robusto
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, `timesheet-${getDateString()}.log`);
const ERROR_FILE = path.join(LOG_DIR, `errors-${getDateString()}.log`);

// Criar diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${getDateString()} ${hours}:${minutes}:${seconds}`;
}

function writeLog(level, message, data = null) {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    data
  };

  // Linha formatada para arquivo
  let logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (data) {
    logLine += `\n${JSON.stringify(data, null, 2)}`;
  }
  logLine += '\n';

  // Escrever no arquivo principal
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (err) {
    console.error('Erro ao escrever log:', err.message);
  }

  // Se for erro, escrever também no arquivo de erros
  if (level === 'error') {
    try {
      fs.appendFileSync(ERROR_FILE, logLine);
    } catch (err) {
      console.error('Erro ao escrever log de erro:', err.message);
    }
  }

  // Console
  console.log(logLine.trim());
}

function info(message, data = null) {
  writeLog('info', message, data);
}

function warn(message, data = null) {
  writeLog('warn', message, data);
}

function error(message, data = null) {
  writeLog('error', message, data);
}

function success(message, data = null) {
  writeLog('success', message, data);
}

function step(stepNumber, message) {
  writeLog('info', `STEP ${stepNumber}: ${message}`);
}

/**
 * Limpar logs antigos (manter últimos 30 dias)
 */
function cleanOldLogs(keepDays = 30) {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const now = new Date();
    const maxAge = keepDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        info(`Log antigo removido: ${file}`);
      }
    }
  } catch (err) {
    error('Erro ao limpar logs antigos', { error: err.message });
  }
}

module.exports = {
  info,
  warn,
  error,
  success,
  step,
  cleanOldLogs,
  LOG_DIR,
  LOG_FILE,
  ERROR_FILE
};
