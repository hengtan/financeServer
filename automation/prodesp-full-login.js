/**
 * Login Completo - Prodesp (com 2FA Microsoft)
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: 'tjheng@apoioprodesp.sp.gov.br',
  password: '65ASqw56!!.'
};

async function fullLogin() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Login Prodesp (Microsoft + 2FA)\n');

    console.log('1️⃣ Acessando portal...');
    await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
    await page.waitForTimeout(3000);

    console.log('2️⃣ Preenchendo usuário...');
    await page.fill('#i0116', CREDENTIALS.username);
    console.log(`   ✅ ${CREDENTIALS.username}`);
    await page.waitForTimeout(1000);

    console.log('3️⃣ Clicando em Next...');
    await page.click('#idSIButton9');
    await page.waitForTimeout(3000);

    console.log('4️⃣ Preenchendo senha...');
    await page.fill('#i0118', CREDENTIALS.password);
    console.log('   ✅ Senha preenchida');
    await page.waitForTimeout(1000);

    console.log('5️⃣ Clicando em Sign in...');
    await page.click('#idSIButton9');
    await page.waitForTimeout(5000);

    console.log('\n⏸️  AGUARDANDO 2FA - Complete no celular/app Microsoft Authenticator');
    console.log('   (Aguardando 60 segundos para você aprovar...)\n');
    await page.waitForTimeout(60000);

    console.log(`\n📍 URL atual: ${page.url()}\n`);

    // Verificar se chegou em alguma página interna
    if (page.url().includes('portaloutsourcing')) {
      console.log('✅ Login provavelmente bem-sucedido!');

      console.log('\n6️⃣ Procurando elementos da página...\n');

      const links = await page.locator('a:visible').all();
      console.log(`Total de links: ${links.length}\n`);

      for (let i = 0; i < Math.min(15, links.length); i++) {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href') || '';
        console.log(`Link ${i}: "${text?.trim()}" -> ${href}`);
      }
    } else {
      console.log('⚠️  Ainda não completou o login ou está em outra página');
    }

    console.log('\n⏸️  Aguardando mais 60 segundos para inspeção...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Teste finalizado!');
  }
}

fullLogin();
