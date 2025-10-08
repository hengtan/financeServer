/**
 * ⚠️ ATENÇÃO - Este script VAI SALVAR os dados!
 * Preenche múltiplos dias e clica em Salvar
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

// Dados para preencher
const DAYS_TO_FILL = [
  { date: '30/09/2025', hours: ['09:09', '12:10', '13:15', '18:19'] },
  { date: '01/10/2025', hours: ['09:10', '13:00', '14:12', '18:25'] },
  { date: '02/10/2025', hours: ['09:09', '12:40', '13:45', '18:25'] },
  { date: '03/10/2025', hours: ['09:07', '12:35', '13:50', '18:31'] }
];

const JUSTIFICATIVA_GERAL = 'Atualizacao do Ponto';

async function saveHours() {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('⚠️  ATENÇÃO - Este script VAI SALVAR os dados!\n');

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

    console.log('4️⃣ Entrada de Batidas...');
    await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
    await page.waitForTimeout(3000);

    // Mudar para a nova janela
    const pages = context.pages();
    const newPage = pages[pages.length - 1];

    console.log('\n5️⃣ Preenchendo justificativa geral...\n');

    // Preencher justificativa no topo
    try {
      await newPage.fill('#GB_txtJustificativa', JUSTIFICATIVA_GERAL);
      console.log(`   ✅ Justificativa geral: "${JUSTIFICATIVA_GERAL}"\n`);
    } catch (e) {
      console.log(`   ⚠️  Não conseguiu preencher justificativa: ${e.message}\n`);
    }

    console.log('6️⃣ Preenchendo horários dos dias...\n');

    // Procurar todos os spans de data
    const dateSpans = await newPage.locator('span[id^="GB_l"][id$="_lblData"]').all();

    for (const dayData of DAYS_TO_FILL) {
      console.log(`   📅 ${dayData.date}:`);

      let rowIndex = null;

      // Procurar a linha da data
      for (let i = 0; i < dateSpans.length; i++) {
        const dateText = await dateSpans[i].textContent();
        const id = await dateSpans[i].getAttribute('id');

        if (dateText === dayData.date) {
          const match = id.match(/GB_l(\d+)_lblData/);
          if (match) {
            rowIndex = match[1];
            break;
          }
        }
      }

      if (rowIndex === null) {
        console.log(`      ❌ Data não encontrada!\n`);
        continue;
      }

      // Preencher os 4 horários
      const fields = ['Ent1', 'Sai1', 'Ent2', 'Sai2'];

      for (let i = 0; i < fields.length && i < dayData.hours.length; i++) {
        const fieldId = `#GB_l${rowIndex}_txt${fields[i]}`;
        const value = dayData.hours[i];

        try {
          await newPage.fill(fieldId, value);
          console.log(`      ✅ ${fields[i]}: ${value}`);
          await newPage.waitForTimeout(200);
        } catch (e) {
          console.log(`      ❌ Erro em ${fields[i]}: ${e.message}`);
        }
      }

      console.log('');
    }

    console.log('7️⃣ Procurando botão Salvar...\n');

    // Procurar botão Salvar
    const saveButtonSelectors = [
      'button:has-text("Salvar")',
      'input[type="submit"][value*="Salvar"]',
      'input[type="button"][value*="Salvar"]',
      '#btnSalvar',
      'a:has-text("Salvar")',
      '[onclick*="salvar"]'
    ];

    let saved = false;

    for (const selector of saveButtonSelectors) {
      try {
        const element = await newPage.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   ✅ Botão Salvar encontrado: ${selector}\n`);

          console.log('⏸️  AGUARDE 10 segundos antes de salvar...');
          console.log('   (Verifique se está tudo certo!)');
          await newPage.waitForTimeout(10000);

          console.log('\n💾 SALVANDO...\n');
          await element.click();
          await newPage.waitForTimeout(2000);

          saved = true;
          break;
        }
      } catch (e) {
        // Continuar tentando próximo seletor
      }
    }

    if (!saved) {
      console.log('   ❌ Botão Salvar não encontrado automaticamente');
      console.log('   📍 Botões visíveis na página:');

      const buttons = await newPage.locator('button:visible, input[type="submit"]:visible, input[type="button"]:visible').all();

      for (let i = 0; i < Math.min(10, buttons.length); i++) {
        const id = await buttons[i].getAttribute('id') || 'sem-id';
        const value = await buttons[i].getAttribute('value') || '';
        const text = await buttons[i].textContent();

        console.log(`      ${i}: ${id} | value="${value}" | text="${text?.trim()}"`);
      }
    }

    console.log('\n⏸️  Aguardando 30 segundos para verificação...');
    await newPage.waitForTimeout(30000);

    if (saved) {
      console.log('\n✅ Dados SALVOS com sucesso!');
    } else {
      console.log('\n⚠️  Dados preenchidos mas não foi possível clicar em Salvar automaticamente');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Script finalizado!');
  }
}

saveHours();
