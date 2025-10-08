/**
 * Prodesp - Usar Sessão Salva (SEM 2FA)
 *
 * Este script carrega a sessão salva e acessa diretamente sem 2FA.
 * Execute prodesp-save-session.js primeiro para salvar a sessão.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, 'prodesp-session.json');

async function useSession() {
  // Verificar se existe sessão salva
  if (!fs.existsSync(SESSION_FILE)) {
    console.log('❌ Arquivo de sessão não encontrado!');
    console.log('   Execute primeiro: node prodesp-save-session.js\n');
    return;
  }

  const browser = await chromium.launch({ headless: false, slowMo: 800 });

  // Carregar sessão salva
  const sessionState = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
  const context = await browser.newContext({ storageState: sessionState });
  const page = await context.newPage();

  try {
    console.log('🚀 Prodesp - Usando Sessão Salva (SEM 2FA)\n');

    console.log('1️⃣ Acessando portal com sessão salva...');
    await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`\n📍 URL atual: ${currentUrl}\n`);

    // Verificar se precisa fazer login no Prodesp
    const hasLoginFields = await page.locator('#txtUsuario').isVisible({ timeout: 3000 }).catch(() => false);

    if (currentUrl.includes('login') && currentUrl.includes('microsoft')) {
      console.log('⚠️  Sessão Microsoft expirou! Você precisa fazer login novamente.');
      console.log('   Execute: node prodesp-save-session.js\n');
    } else if (hasLoginFields) {
      console.log('⚠️  Precisa fazer login no sistema Prodesp...\n');

      const PRODESP_CREDENTIALS = {
        username: '23294651813',
        password: '65ASqw56!.'
      };

      console.log('3️⃣ Preenchendo usuário Prodesp...');
      await page.fill('#txtUsuario', PRODESP_CREDENTIALS.username);
      console.log(`   ✅ ${PRODESP_CREDENTIALS.username}`);
      await page.waitForTimeout(1000);

      console.log('4️⃣ Preenchendo senha Prodesp...');
      await page.fill('#txtSenha', PRODESP_CREDENTIALS.password);
      console.log('   ✅ Senha preenchida');
      await page.waitForTimeout(1000);

      console.log('5️⃣ Clicando em Entrar...');
      const entrarButton = await page.locator('input[type="submit"], input[type="button"][value*="Entrar"], button:has-text("Entrar")').first();
      await entrarButton.click();
      await page.waitForTimeout(5000);

      console.log('\n✅ Login Prodesp concluído!\n');
    }

    // Clicar em Atividades e selecionar
    console.log('6️⃣ Clicando em Atividades...');
    if (await page.locator('#MainContent_btnTarefas').isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.click('#MainContent_btnTarefas');
      await page.waitForTimeout(3000);
      console.log('   ✅ Botão Atividades clicado\n');

      console.log('7️⃣ Selecionando "Atividades de Desenvolvimento"...');
      await page.selectOption('#MainContent_ddlAtividade', '54'); // value="54" = Atividades de Desenvolvimento
      await page.waitForTimeout(2000);
      console.log('   ✅ Atividade selecionada\n');
    } else if (currentUrl.includes('portaloutsourcing')) {
      console.log('✅ Login automático bem-sucedido! (SEM 2FA)\n');

      console.log('2️⃣ Procurando elementos da página...\n');

      // Listar links disponíveis
      const links = await page.locator('a:visible').all();
      console.log(`Total de links visíveis: ${links.length}\n`);

      for (let i = 0; i < Math.min(15, links.length); i++) {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href') || '';
        console.log(`Link ${i}: "${text?.trim()}" -> ${href}`);
      }

      console.log('\n⏸️  Aguardando 60 segundos para inspeção...');
      await page.waitForTimeout(60000);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Finalizado!');
  }
}

useSession();
