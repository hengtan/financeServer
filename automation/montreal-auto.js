/**
 * Script de automação Montreal - Registro de Ponto
 */

const { chromium } = require('playwright');
const readline = require('readline');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

async function askToContinue(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`\n${message} (pressione Enter para continuar)`, () => {
      rl.close();
      resolve();
    });
  });
}

async function automateMontrealLogin() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando automação Montreal...\n');

    // Passo 1: Login
    console.log('1️⃣ Acessando página de login...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false&ReturnUrl=%2fCorpore.Net%2fMain.aspx%3fActionID%3dPtoEspCartaoActionWeb%26SelectedMenuIDKey%3dbtnEspelhoCartao');
    await page.waitForTimeout(2000);

    console.log('2️⃣ Preenchendo credenciais...');
    await page.fill('#txtUser', CREDENTIALS.username);
    await page.fill('#txtPass', CREDENTIALS.password);

    console.log('3️⃣ Clicando em Acessar...');
    await page.click('#btnLogin');
    await page.waitForTimeout(3000);

    console.log('\n✅ Login realizado com sucesso!\n');

    console.log('4️⃣ Procurando e clicando em "Anexos"...');
    await page.waitForTimeout(2000);

    // Tentar diferentes seletores para Anexos
    const anexosSelectors = [
      '#ctl26_ctl01_ctl01',
      'div.CaptionStyle:has-text("Anexos")',
      'text=Anexos'
    ];

    let anexosClicked = false;
    for (const selector of anexosSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`   ✅ Anexos encontrado e clicado: ${selector}`);
          anexosClicked = true;
          break;
        }
      } catch (e) {
        console.log(`   ❌ Seletor não encontrado: ${selector}`);
      }
    }

    if (!anexosClicked) {
      console.log('   ⚠️  Anexos não encontrado automaticamente');
    }

    await page.waitForTimeout(1000);

    console.log('5️⃣ Procurando e clicando em "Entrada de Batidas"...');

    const entradaBatidasSelectors = [
      'td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")',
      'span:has-text("Entrada de Batidas")',
      'text=Entrada de Batidas'
    ];

    let entradaClicked = false;
    for (const selector of entradaBatidasSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`   ✅ Entrada de Batidas encontrado e clicado: ${selector}`);
          entradaClicked = true;
          break;
        }
      } catch (e) {
        console.log(`   ❌ Seletor não encontrado: ${selector}`);
      }
    }

    if (!entradaClicked) {
      console.log('   ⚠️  Entrada de Batidas não encontrado automaticamente');
    }

    await page.waitForTimeout(3000);

    console.log('\n✅ Navegação completa!\n');
    console.log('📍 Agora inspecione os campos do formulário:');
    console.log('   1. Campo Data');
    console.log('   2. Campo Hora(s)');
    console.log('   3. Campo Justificativa');
    console.log('   4. Botão Salvar\n');

    console.log('🔍 Aguardando 60 segundos para você inspecionar...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro durante automação:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Script finalizado!');
  }
}

// Executar
if (require.main === module) {
  automateMontrealLogin();
}

module.exports = { automateMontrealLogin };
