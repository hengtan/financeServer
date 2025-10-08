/**
 * Script Principal - Automação Diária de Ponto
 *
 * Fluxo:
 * 1. Verifica se é dia útil (não executa em feriados/fins de semana)
 * 2. Batida de entrada na Prodesp (random 8:50-9:10)
 * 3. Seleciona "Atividades de Desenvolvimento"
 * 4. Calcula horários do dia (9h trabalho + 1h almoço)
 * 5. Salva horários em arquivo
 * 6. Batida de saída na Prodesp (no final do dia)
 * 7. Atualiza Montreal com os 4 horários
 */

const { chromium } = require('playwright');
const { isWorkday, formatDate } = require('./checkWorkday');
const fs = require('fs');
const path = require('path');

const TIMES_FILE = path.join(__dirname, 'daily-times.json');

const CREDENTIALS = {
  microsoft: {
    username: 'tjheng@apoioprodesp.sp.gov.br',
    password: '65ASqw56!!.'
  },
  prodesp: {
    username: '23294651813',
    password: '65ASqw56!.'
  },
  montreal: {
    username: '23294651813',
    password: '65ASqw56!@.'
  }
};

/**
 * Gera horário random
 */
function randomTime(minHour, minMinute, maxHour, maxMinute) {
  const minTotalMinutes = minHour * 60 + minMinute;
  const maxTotalMinutes = maxHour * 60 + maxMinute;
  const randomMinutes = Math.floor(Math.random() * (maxTotalMinutes - minTotalMinutes + 1)) + minTotalMinutes;

  const hours = Math.floor(randomMinutes / 60);
  const minutes = randomMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Adiciona minutos a um horário
 */
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calcula horários do dia
 */
function calculateDayTimes() {
  // Entrada: random entre 8:50 e 9:10
  const entryTime = randomTime(8, 50, 9, 10);

  // Almoço: random entre 12:00 e 13:00
  const lunchStartBase = randomTime(12, 0, 13, 0);
  // Adicionar random de -15 a +15 minutos
  const lunchRandomOffset = Math.floor(Math.random() * 31) - 15;
  const lunchStart = addMinutes(lunchStartBase, lunchRandomOffset);

  // Volta do almoço: 1h depois (com mesmo random)
  const lunchRandomDuration = 60 + (Math.floor(Math.random() * 31) - 15);
  const lunchEnd = addMinutes(lunchStart, lunchRandomDuration);

  // Calcular saída para completar 9h de trabalho
  // Tempo de trabalho de manhã
  const [entryH, entryM] = entryTime.split(':').map(Number);
  const [lunchStartH, lunchStartM] = lunchStart.split(':').map(Number);
  const morningMinutes = (lunchStartH * 60 + lunchStartM) - (entryH * 60 + entryM);

  // Precisa trabalhar 9h = 540 minutos
  const afternoonMinutes = 540 - morningMinutes;
  const exitTime = addMinutes(lunchEnd, afternoonMinutes);

  return {
    entry: entryTime,      // Ent1
    lunchStart: lunchStart, // Sai1
    lunchEnd: lunchEnd,     // Ent2
    exit: exitTime          // Sai2
  };
}

/**
 * Salva horários do dia
 */
function saveDailyTimes(date, times) {
  let data = {};
  if (fs.existsSync(TIMES_FILE)) {
    data = JSON.parse(fs.readFileSync(TIMES_FILE, 'utf-8'));
  }

  data[date] = times;
  fs.writeFileSync(TIMES_FILE, JSON.stringify(data, null, 2));
}

/**
 * Carrega horários do dia
 */
function loadDailyTimes(date) {
  if (!fs.existsSync(TIMES_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(TIMES_FILE, 'utf-8'));
  return data[date] || null;
}

/**
 * Batida de ponto na Prodesp
 */
async function clockInProdesp(type = 'entry') {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });

  // Carregar sessão se existir
  const SESSION_FILE = path.join(__dirname, 'prodesp-session.json');
  let context;

  if (fs.existsSync(SESSION_FILE)) {
    const sessionState = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    context = await browser.newContext({ storageState: sessionState });
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();

  try {
    console.log(`🕐 Batendo ponto - ${type === 'entry' ? 'ENTRADA' : 'SAÍDA'}\n`);

    await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
    await page.waitForTimeout(3000);

    // Verificar se precisa fazer login
    const hasLoginFields = await page.locator('#txtUsuario').isVisible({ timeout: 3000 }).catch(() => false);

    if (hasLoginFields) {
      console.log('Login Prodesp...');
      await page.fill('#txtUsuario', CREDENTIALS.prodesp.username);
      await page.fill('#txtSenha', CREDENTIALS.prodesp.password);
      const entrarButton = await page.locator('input[type="submit"], input[type="button"][value*="Entrar"]').first();
      await entrarButton.click();
      await page.waitForTimeout(5000);
    }

    // Clicar em Atividades
    console.log('Clicando em Atividades...');
    await page.click('#MainContent_btnTarefas');
    await page.waitForTimeout(3000);

    // Selecionar atividade
    console.log('Selecionando "Atividades de Desenvolvimento"...');
    await page.selectOption('#MainContent_ddlAtividade', '54');
    await page.waitForTimeout(2000);

    // Clicar em "Iniciar Atividade"
    console.log('Clicando em "Iniciar Atividade"...');
    await page.click('#MainContent_btnIniciar');
    await page.waitForTimeout(3000);

    console.log(`✅ Ponto registrado - ${type === 'entry' ? 'ENTRADA' : 'SAÍDA'}\n`);

    await page.waitForTimeout(5000);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

/**
 * Atualiza Montreal com horários do dia
 */
async function updateMontreal(date, times) {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🏢 Atualizando Montreal...\n');

    // Login
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
    await page.fill('#txtUser', CREDENTIALS.montreal.username);
    await page.fill('#txtPass', CREDENTIALS.montreal.password);
    await page.click('#btnLogin');
    await page.waitForTimeout(3000);

    // Espelho do Cartão
    await page.click('#ctl18_REC_PtoEspCartaoActionWeb_LinkControl');
    await page.waitForTimeout(2000);

    // Anexos
    await page.click('#ctl26_ctl01_ctl01');
    await page.waitForTimeout(1000);

    // Entrada de Batidas
    await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
    await page.waitForTimeout(3000);

    const pages = context.pages();
    const newPage = pages[pages.length - 1];

    // Preencher justificativa
    await newPage.fill('#GB_txtJustificativa', 'Atualizacao do Ponto');

    // Procurar linha da data
    const dateSpans = await newPage.locator('span[id^="GB_l"][id$="_lblData"]').all();
    let rowIndex = null;

    const dateFormatted = date.split('-').reverse().join('/'); // 2025-10-06 -> 06/10/2025

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
      console.log(`Preenchendo ${dateFormatted}...`);

      await newPage.fill(`#GB_l${rowIndex}_txtEnt1`, times.entry);
      await newPage.fill(`#GB_l${rowIndex}_txtSai1`, times.lunchStart);
      await newPage.fill(`#GB_l${rowIndex}_txtEnt2`, times.lunchEnd);
      await newPage.fill(`#GB_l${rowIndex}_txtSai2`, times.exit);

      console.log(`  Ent1: ${times.entry}`);
      console.log(`  Sai1: ${times.lunchStart}`);
      console.log(`  Ent2: ${times.lunchEnd}`);
      console.log(`  Sai2: ${times.exit}\n`);

      // Salvar
      await newPage.click('#GB_btnSalvar_tblabel');
      await newPage.waitForTimeout(3000);

      // Fechar modal
      await newPage.close();
      await page.waitForTimeout(1000);

      // Atualizar
      await page.click('#ctl26_btnAtualizar_tblabel');
      await page.waitForTimeout(3000);

      console.log('✅ Montreal atualizado com sucesso!\n');
    } else {
      console.log('❌ Data não encontrada na tabela\n');
    }

    await page.waitForTimeout(5000);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

/**
 * Fluxo principal
 */
async function main() {
  const today = new Date();
  const dateStr = formatDate(today);

  console.log('═══════════════════════════════════════════');
  console.log('   AUTOMAÇÃO DIÁRIA DE PONTO');
  console.log('═══════════════════════════════════════════\n');

  // Verificar se é dia útil
  const workdayCheck = isWorkday(today);

  if (!workdayCheck.isWorkday) {
    console.log(`❌ ${dateStr} - NÃO É DIA ÚTIL`);
    console.log(`   Motivo: ${workdayCheck.reason}`);
    if (workdayCheck.dayName) console.log(`   ${workdayCheck.dayName}`);
    if (workdayCheck.holiday) console.log(`   ${workdayCheck.holiday} (${workdayCheck.type})`);
    console.log('\n⏭️  Script não será executado\n');
    return;
  }

  console.log(`✅ ${dateStr} - DIA ÚTIL\n`);

  // Verificar se já existe horários salvos para hoje
  let times = loadDailyTimes(dateStr);

  if (!times) {
    console.log('📊 Calculando horários do dia...\n');
    times = calculateDayTimes();
    saveDailyTimes(dateStr, times);

    console.log('Horários calculados:');
    console.log(`  Entrada: ${times.entry}`);
    console.log(`  Saída almoço: ${times.lunchStart}`);
    console.log(`  Volta almoço: ${times.lunchEnd}`);
    console.log(`  Saída: ${times.exit}\n`);
  } else {
    console.log('📋 Usando horários já salvos:');
    console.log(`  Entrada: ${times.entry}`);
    console.log(`  Saída almoço: ${times.lunchStart}`);
    console.log(`  Volta almoço: ${times.lunchEnd}`);
    console.log(`  Saída: ${times.exit}\n`);
  }

  // Determinar qual ação tomar baseado na hora atual
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  console.log(`🕐 Hora atual: ${currentTime}\n`);

  // Se for antes das 10h, fazer entrada
  if (currentHour < 10) {
    console.log('🔹 Executando: Batida de ENTRADA\n');
    await clockInProdesp('entry');
  }
  // Se for depois das 17h, fazer saída e atualizar Montreal
  else if (currentHour >= 17) {
    console.log('🔹 Executando: Batida de SAÍDA\n');
    await clockInProdesp('exit');

    console.log('🔹 Atualizando Montreal...\n');
    await updateMontreal(dateStr, times);
  }
  // Entre 10h e 17h
  else {
    console.log('⏰ Aguardando horário de saída (após 17h)\n');
    console.log('   Ou execute manualmente:\n');
    console.log('   - Entrada: node daily-timesheet.js entry');
    console.log('   - Saída: node daily-timesheet.js exit\n');
  }

  console.log('✅ Script finalizado!\n');
}

// Executar
main();
