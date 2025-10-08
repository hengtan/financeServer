/**
 * Debug - verificar o que está sendo digitado
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@'
};

async function debugMontrealLogin() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Debug Montreal Login\n');
    console.log('Credenciais que serão digitadas:');
    console.log(`Usuário: "${CREDENTIALS.username}" (${CREDENTIALS.username.length} caracteres)`);
    console.log(`Senha: "${CREDENTIALS.password}" (${CREDENTIALS.password.length} caracteres)`);
    console.log('\nCaracteres da senha:');
    for (let i = 0; i < CREDENTIALS.password.length; i++) {
      console.log(`  [${i}] = "${CREDENTIALS.password[i]}" (código: ${CREDENTIALS.password.charCodeAt(i)})`);
    }

    console.log('\n1️⃣ Acessando página...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
    await page.waitForTimeout(2000);

    console.log('2️⃣ Limpando campos...');
    await page.fill('#txtUser', '');
    await page.fill('#txtPass', '');

    console.log('3️⃣ Preenchendo usuário...');
    await page.type('#txtUser', CREDENTIALS.username, { delay: 100 });

    console.log('4️⃣ Preenchendo senha...');
    await page.type('#txtPass', CREDENTIALS.password, { delay: 100 });

    console.log('\n5️⃣ Valores nos campos:');
    const userValue = await page.inputValue('#txtUser');
    const passValue = await page.inputValue('#txtPass');
    console.log(`Campo usuário: "${userValue}"`);
    console.log(`Campo senha: "${passValue}"`);
    console.log(`Match usuário: ${userValue === CREDENTIALS.username}`);
    console.log(`Match senha: ${passValue === CREDENTIALS.password}`);

    console.log('\n⏸️  Aguardando 30 segundos para você verificar...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

debugMontrealLogin();
