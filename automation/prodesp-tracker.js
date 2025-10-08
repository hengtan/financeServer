/**
 * Script para rastrear elementos do Portal Prodesp
 * NÃO EXECUTAR - apenas para identificar seletores
 */

const { chromium } = require('playwright');

async function trackProdespElements() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Iniciando rastreamento Prodesp...\n');

    // Passo 1: Acessar página de login
    console.log('1️⃣ Acessando página de login...');
    await page.goto('https://portaloutsourcing-governosp.msappproxy.net/acessologinlegado.aspx');
    await page.waitForTimeout(3000);

    // Pode aparecer login Microsoft primeiro
    console.log('⚠️  Aguardando possível login Microsoft...');
    await page.waitForTimeout(5000);

    // Passo 2: Procurar botão "Entrar"
    console.log('\n2️⃣ Procurando botão "Entrar"...');
    const enterSelectors = [
      'button:has-text("Entrar")',
      'input[type="submit"][value*="Entrar"]',
      'a:has-text("Entrar")',
      '#btnEntrar',
      '.btn-entrar'
    ];

    for (const selector of enterSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Botão Entrar encontrado: ${selector}`);
          // await element.click(); // COMENTADO - NÃO EXECUTAR
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 3: Aguardar página carregar e procurar ícone de Apontamento
    console.log('\n3️⃣ Procurando ícone "Apontamento de Atividades"...');
    await page.waitForTimeout(3000);

    const iconSelectors = [
      'a[title*="Apontamento de Atividades"]',
      'a:has-text("Apontamento de Atividades")',
      'img[alt*="Apontamento"]',
      '[data-action="apontamento"]',
      'a[href*="ApontamentoAtividade"]'
    ];

    for (const selector of iconSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Ícone Apontamento encontrado: ${selector}`);
          const href = await element.getAttribute('href');
          console.log(`   URL destino: ${href}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 4: Navegar para página de apontamento (simulado)
    console.log('\n4️⃣ Navegando para página de apontamento...');
    // await page.goto('https://portaloutsourcing-governosp.msappproxy.net/Apontamento/ApontamentoAtividade.aspx');
    // await page.waitForTimeout(2000);

    // Passo 5: Procurar dropdown "Atividade"
    console.log('\n5️⃣ Procurando dropdown "Atividade"...');
    const dropdownSelectors = [
      'select[name*="Atividade"]',
      'select#ddlAtividade',
      'select.atividade-dropdown',
      'select:has-text("Atividade")',
      '[data-field="atividade"]'
    ];

    for (const selector of dropdownSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Dropdown Atividade encontrado: ${selector}`);
          // Listar opções
          const options = await element.locator('option').all();
          console.log(`   Total de opções: ${options.length}`);
          for (let i = 0; i < Math.min(5, options.length); i++) {
            const text = await options[i].textContent();
            console.log(`   - ${text}`);
          }
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    // Passo 6: Procurar botão "Iniciar Atividade"
    console.log('\n6️⃣ Procurando botão "Iniciar Atividade"...');
    const startButtonSelectors = [
      'button:has-text("Iniciar Atividade")',
      'input[type="submit"][value*="Iniciar"]',
      'a:has-text("Iniciar")',
      '#btnIniciar',
      '.btn-iniciar'
    ];

    for (const selector of startButtonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Botão Iniciar Atividade encontrado: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não encontrado: ${selector}`);
      }
    }

    console.log('\n✅ Rastreamento Prodesp concluído!\n');
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
  trackProdespElements();
}

module.exports = { trackProdespElements };
