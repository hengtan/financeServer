/**
 * Prodesp - Salvar Sessão (Executar UMA VEZ com 2FA)
 *
 * Este script faz login com 2FA e salva a sessão em arquivo.
 * Depois você pode usar prodesp-with-session.js sem precisar de 2FA.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CREDENTIALS = {
  // Login Microsoft
  microsoft: {
    username: 'tjheng@apoioprodesp.sp.gov.br',
    password: '65ASqw56!!.'
  },
  // Login Prodesp (após 2FA)
  prodesp: {
    username: '23294651813',
    password: '65ASqw56!.'
  }
};

const SESSION_FILE = path.join(__dirname, 'prodesp-session.json');

async function saveSession() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Login Prodesp - Salvando Sessão\n');

    console.log('1️⃣ Acessando portal...');
    await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
    await page.waitForTimeout(3000);

    console.log('2️⃣ Preenchendo usuário Microsoft...');
    await page.fill('#i0116', CREDENTIALS.microsoft.username);
    console.log(`   ✅ ${CREDENTIALS.microsoft.username}`);
    await page.waitForTimeout(1000);

    console.log('3️⃣ Clicando em Next...');
    await page.click('#idSIButton9');
    await page.waitForTimeout(3000);

    console.log('4️⃣ Preenchendo senha Microsoft...');
    await page.fill('#i0118', CREDENTIALS.microsoft.password);
    console.log('   ✅ Senha preenchida');
    await page.waitForTimeout(1000);

    console.log('5️⃣ Clicando em Sign in...');
    await page.click('#idSIButton9');
    await page.waitForTimeout(5000);

    console.log('\n⏸️  AGUARDANDO 2FA - Complete no celular/app Microsoft Authenticator');
    console.log('   🔔 IMPORTANTE: Clique em "Sim" ou aprove no app!\n');
    console.log('   Aguardando 90 segundos...\n');
    await page.waitForTimeout(90000);

    // Após 2FA, fazer login no sistema Prodesp
    console.log('\n6️⃣ 2FA concluído! Fazendo login no sistema Prodesp...');

    // Verificar se chegou na página de login legado
    if (await page.locator('#txtUsuario').isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('7️⃣ Preenchendo usuário Prodesp...');
      await page.fill('#txtUsuario', CREDENTIALS.prodesp.username);
      console.log(`   ✅ ${CREDENTIALS.prodesp.username}`);
      await page.waitForTimeout(1000);

      console.log('8️⃣ Preenchendo senha Prodesp...');
      await page.fill('#txtSenha', CREDENTIALS.prodesp.password);
      console.log('   ✅ Senha preenchida');
      await page.waitForTimeout(1000);

      console.log('9️⃣ Clicando em Entrar...');
      // Procurar botão Entrar
      const entrarButton = await page.locator('input[type="submit"], input[type="button"][value*="Entrar"], button:has-text("Entrar")').first();
      await entrarButton.click();
      await page.waitForTimeout(5000);
    }

    // Verificar se o login foi bem-sucedido
    const currentUrl = page.url();
    console.log(`\n📍 URL atual: ${currentUrl}\n`);

    // Verificar se ainda tem campos de login ou se já está logado
    const hasLoginFields = await page.locator('#txtUsuario').isVisible({ timeout: 2000 }).catch(() => false);

    if (!hasLoginFields || currentUrl.includes('default.aspx') || currentUrl.includes('home')) {
      console.log('✅ Login bem-sucedido!\n');

      console.log('💾 Salvando sessão...');

      // Salvar estado da sessão (cookies + localStorage + sessionStorage)
      const sessionState = await context.storageState();
      fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionState, null, 2));

      console.log(`   ✅ Sessão salva em: ${SESSION_FILE}\n`);
      console.log('🎉 Pronto! Agora você pode usar prodesp-with-session.js sem 2FA!\n');

      // Listar elementos visíveis
      console.log('🔍 Elementos da página:\n');
      const links = await page.locator('a:visible').all();
      console.log(`   Links visíveis: ${links.length}`);
      for (let i = 0; i < Math.min(10, links.length); i++) {
        const text = await links[i].textContent();
        console.log(`   ${i}: ${text?.trim()}`);
      }

      console.log('\n⏸️  Aguardando 30 segundos para verificação...');
      await page.waitForTimeout(30000);

    } else {
      console.log('❌ Login não completado - Ainda vejo campos de login');
      console.log('   Verifique se as credenciais estão corretas\n');

      console.log('   Aguardando 30 segundos para inspeção manual...');
      await page.waitForTimeout(30000);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Finalizado!');
  }
}

saveSession();
