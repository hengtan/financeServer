/**
 * Script para rastrear elementos do Portal Montreal
 * NÃO EXECUTAR - apenas para identificar seletores
 */

const { chromium } = require('playwright');

async function trackMontrealElements() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Iniciando rastreamento Montreal...\n');

    // Passo 1: Acessar página de login
    console.log('1️⃣ Acessando página de login...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false&ReturnUrl=%2fCorpore.Net%2fMain.aspx%3fActionID%3dPtoEspCartaoActionWeb%26SelectedMenuIDKey%3dbtnEspelhoCartao');
    await page.waitForTimeout(2000);

    // Passo 2: Procurar campos de login
    console.log('\n2️⃣ Procurando campos de login...');
    const usernameSelectors = [
      'input[name*="usuario"]',
      'input[name*="login"]',
      'input[type="text"]',
      '#txtUsuario',
      '#username'
    ];

    for (const selector of usernameSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Campo usuário encontrado: ${selector}`);
          // await element.fill('23294651813'); // COMENTADO
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    const passwordSelectors = [
      'input[name*="senha"]',
      'input[name*="password"]',
      'input[type="password"]',
      '#txtSenha',
      '#password'
    ];

    for (const selector of passwordSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Campo senha encontrado: ${selector}`);
          // await element.fill('65ASqw56!@'); // COMENTADO
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 3: Procurar botão de login
    console.log('\n3️⃣ Procurando botão de login...');
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Entrar")',
      '#btnLogin',
      '.btn-login'
    ];

    for (const selector of loginButtonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Botão login encontrado: ${selector}`);
          // await element.click(); // COMENTADO
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 4: Aguardar e procurar link "Espelho do Cartão"
    console.log('\n4️⃣ Procurando link "Espelho do Cartão"...');
    await page.waitForTimeout(3000);

    const espelhoSelectors = [
      'a:has-text("Espelho do Cartão")',
      'a:has-text("Espelho")',
      'a[href*="EspelhoCartao"]',
      '#lnkEspelho',
      '[data-action="espelho"]'
    ];

    for (const selector of espelhoSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Link Espelho do Cartão encontrado: ${selector}`);
          // await element.click(); // COMENTADO
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 5: Procurar link "Anexos"
    console.log('\n5️⃣ Procurando link "Anexos"...');
    await page.waitForTimeout(2000);

    const anexosSelectors = [
      'a:has-text("Anexos")',
      'a[href*="anexos"]',
      '#lnkAnexos',
      '[data-action="anexos"]'
    ];

    for (const selector of anexosSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Link Anexos encontrado: ${selector}`);
          // await element.click(); // COMENTADO
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 6: Procurar opção "Entrada de batidas" (modal)
    console.log('\n6️⃣ Procurando opção "Entrada de batidas"...');
    await page.waitForTimeout(2000);

    const entradaBatidasSelectors = [
      'a:has-text("Entrada de batidas")',
      'button:has-text("Entrada de batidas")',
      '[data-action="entrada-batidas"]',
      '#lnkEntradaBatidas'
    ];

    for (const selector of entradaBatidasSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Opção Entrada de batidas encontrada: ${selector}`);
          // await element.click(); // COMENTADO
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 7: Procurar campos do modal
    console.log('\n7️⃣ Procurando campos do modal...');
    await page.waitForTimeout(2000);

    console.log('   Procurando campo Data...');
    const dataSelectors = [
      'input[name*="data"]',
      'input[type="date"]',
      '#txtData',
      '[data-field="data"]'
    ];

    for (const selector of dataSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`   ✅ Campo Data encontrado: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    console.log('   Procurando campo Justificativa...');
    const justificativaSelectors = [
      'input[name*="justificativa"]',
      'textarea[name*="justificativa"]',
      '#txtJustificativa',
      '[data-field="justificativa"]'
    ];

    for (const selector of justificativaSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`   ✅ Campo Justificativa encontrado: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    console.log('   Procurando botão Salvar...');
    const salvarSelectors = [
      'button:has-text("Salvar")',
      'input[type="submit"][value*="Salvar"]',
      '#btnSalvar',
      '.btn-salvar'
    ];

    for (const selector of salvarSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`   ✅ Botão Salvar encontrado: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    console.log('\n✅ Rastreamento Montreal concluído!\n');
    console.log('⏸️  Aguardando 30 segundos para inspeção manual...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Erro durante rastreamento:', error.message);
  } finally {
    await browser.close();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  trackMontrealElements();
}

module.exports = { trackMontrealElements };
