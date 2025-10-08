/**
 * Procurar modal/popup de Entrada de Batidas
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

async function findModal() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Procurando modal de Entrada de Batidas...\n');

    // Login
    console.log('1️⃣ Login...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
    await page.fill('#txtUser', CREDENTIALS.username);
    await page.fill('#txtPass', CREDENTIALS.password);
    await page.click('#btnLogin');
    await page.waitForTimeout(3000);

    console.log('2️⃣ Espelho do Cartão...');
    await page.click('#ctl18_REC_PtoEspCartaoActionWeb_LinkControl');
    await page.waitForTimeout(2000);

    console.log('3️⃣ Anexos...');
    await page.click('#ctl26_ctl01_ctl01');
    await page.waitForTimeout(1000);

    console.log('4️⃣ Antes de clicar em Entrada de Batidas...\n');

    // Contar elementos antes
    const beforeInputs = await page.locator('input').count();
    console.log(`Inputs antes: ${beforeInputs}`);

    console.log('\n5️⃣ Clicando em Entrada de Batidas...');
    await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
    await page.waitForTimeout(3000);

    // Verificar se abriu nova janela/popup
    const pages = context.pages();
    console.log(`\nTotal de páginas/tabs: ${pages.length}`);

    // Se tiver mais de uma página, focar na nova
    if (pages.length > 1) {
      const newPage = pages[pages.length - 1];
      console.log('✅ Nova janela/tab detectada!');
      console.log(`URL da nova janela: ${newPage.url()}`);

      // Procurar campos na nova janela
      const inputs = await newPage.locator('input:visible').all();
      console.log(`\nInputs na nova janela: ${inputs.length}`);

      for (let i = 0; i < Math.min(20, inputs.length); i++) {
        const id = await inputs[i].getAttribute('id') || 'sem-id';
        const type = await inputs[i].getAttribute('type') || 'text';
        const value = await inputs[i].inputValue();

        console.log(`  ${i}: ${id} (${type}) = "${value}"`);
      }
    } else {
      // Procurar modal na mesma página
      console.log('\nProcurando modal/popup na mesma página...');

      const afterInputs = await page.locator('input').count();
      console.log(`Inputs depois: ${afterInputs}`);

      // Procurar por iframes
      const frames = page.frames();
      console.log(`\nTotal de frames: ${frames.length}`);

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const url = frame.url();
        console.log(`\nFrame ${i}: ${url}`);

        if (url.includes('PtoatFunAction') || url.includes('Batida')) {
          console.log('  ⭐ Frame relevante encontrado!');

          const frameInputs = await frame.locator('input:visible').all();
          console.log(`  Inputs no frame: ${frameInputs.length}`);

          for (let j = 0; j < Math.min(20, frameInputs.length); j++) {
            const id = await frameInputs[j].getAttribute('id') || 'sem-id';
            const type = await frameInputs[j].getAttribute('type') || 'text';
            const value = await frameInputs[j].inputValue();

            console.log(`    ${j}: ${id} (${type}) = "${value}"`);
          }
        }
      }

      // Procurar divs que parecem modais
      const modals = await page.locator('div[role="dialog"]:visible, div.modal:visible, div.popup:visible').all();
      console.log(`\nModais encontrados: ${modals.length}`);

      // Listar todos os inputs visíveis
      console.log('\nTodos os inputs visíveis após clicar:');
      const allInputs = await page.locator('input:visible').all();

      for (let i = 0; i < Math.min(30, allInputs.length); i++) {
        const id = await allInputs[i].getAttribute('id') || 'sem-id';
        const type = await allInputs[i].getAttribute('type') || 'text';
        const name = await allInputs[i].getAttribute('name') || '';
        const value = await allInputs[i].inputValue();

        console.log(`  ${i}: ${id} | ${name} | ${type} = "${value}"`);
      }
    }

    console.log('\n⏸️  Aguardando 60 segundos para inspeção manual...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

findModal();
