/**
 * Teste de Login - Prodesp
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: 'tjheng@apoioprodesp.sp.gov.br',
  password: '65ASqw56!!'
};

async function testLogin() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Testando login na Prodesp...\n');

    console.log('1️⃣ Acessando Prodesp (Portal Outsourcing)...');
    await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
    await page.waitForTimeout(5000);

    console.log(`URL atual: ${page.url()}\n`);

    // Procurar campos de login
    console.log('2️⃣ Procurando campos de login...\n');

    const inputs = await page.locator('input:visible').all();
    console.log(`Total de inputs visíveis: ${inputs.length}\n`);

    for (let i = 0; i < Math.min(20, inputs.length); i++) {
      const id = await inputs[i].getAttribute('id') || 'sem-id';
      const name = await inputs[i].getAttribute('name') || 'sem-nome';
      const type = await inputs[i].getAttribute('type') || 'text';
      const placeholder = await inputs[i].getAttribute('placeholder') || '';

      console.log(`Input ${i}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Type: ${type}`);
      console.log(`  Placeholder: ${placeholder}`);

      if (type === 'email' || name.includes('user') || name.includes('email') || id.includes('user') || id.includes('email')) {
        console.log(`  ⭐ POSSÍVEL CAMPO DE USUÁRIO`);
      }
      if (type === 'password' || name.includes('pass') || id.includes('pass')) {
        console.log(`  ⭐ POSSÍVEL CAMPO DE SENHA`);
      }
      console.log('');
    }

    // Procurar botões
    console.log('\n3️⃣ Procurando botões...\n');
    const buttons = await page.locator('button:visible, input[type="submit"]:visible').all();

    for (let i = 0; i < Math.min(10, buttons.length); i++) {
      const id = await buttons[i].getAttribute('id') || 'sem-id';
      const text = await buttons[i].textContent();
      const value = await buttons[i].getAttribute('value') || '';

      console.log(`Botão ${i}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Text: ${text?.trim()}`);
      console.log(`  Value: ${value}`);
      console.log('');
    }

    console.log('\n⏸️  Aguardando 60 segundos para inspeção manual...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Teste finalizado!');
  }
}

testLogin();
