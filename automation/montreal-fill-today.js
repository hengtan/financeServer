/**
 * TESTE - Preencher horas do dia atual SEM SALVAR
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

async function fillTodayHours() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 TESTE - Preenchimento do dia atual (SEM SALVAR)\n');

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

    console.log('\n5️⃣ Procurando a linha da data de hoje...\n');

    // Data de hoje no formato dd/mm/yyyy
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const dataHoje = `${dia}/${mes}/${ano}`;

    console.log(`📅 Data de hoje: ${dataHoje}`);

    // Procurar todos os spans de data
    const dateSpans = await newPage.locator('span[id^="GB_l"][id$="_lblData"]').all();
    console.log(`   Total de datas encontradas: ${dateSpans.length}\n`);

    let rowIndex = null;

    for (let i = 0; i < dateSpans.length; i++) {
      const dateText = await dateSpans[i].textContent();
      const id = await dateSpans[i].getAttribute('id');

      if (dateText === dataHoje) {
        // Extrair o índice da linha do ID (ex: GB_l18_lblData -> 18)
        const match = id.match(/GB_l(\d+)_lblData/);
        if (match) {
          rowIndex = match[1];
          console.log(`✅ Data encontrada! Linha: ${rowIndex} (${dateText})`);
          break;
        }
      }
    }

    if (rowIndex === null) {
      console.log(`❌ Data ${dataHoje} não encontrada na tabela!`);
      await newPage.waitForTimeout(10000);
      return;
    }

    console.log('\n6️⃣ Preenchendo horários (TESTE - sem salvar)...\n');

    const hours = {
      Ent1: '09:00',
      Sai1: '12:00',
      Ent2: '13:00',
      Sai2: '18:00'
    };

    // Preencher cada campo
    for (const [field, value] of Object.entries(hours)) {
      const fieldId = `#GB_l${rowIndex}_txt${field}`;

      try {
        await newPage.fill(fieldId, value);
        console.log(`   ✅ ${fieldId} = ${value}`);
        await newPage.waitForTimeout(300);
      } catch (e) {
        console.log(`   ❌ Erro ao preencher ${fieldId}: ${e.message}`);
      }
    }

    // Justificativa (opcional)
    const justificativaId = `#GB_l${rowIndex}_txtJust`;
    const justificativa = 'Alteração de ponto';

    try {
      await newPage.fill(justificativaId, justificativa);
      console.log(`   ✅ ${justificativaId} = "${justificativa}"`);
    } catch (e) {
      console.log(`   ❌ Erro ao preencher justificativa: ${e.message}`);
    }

    console.log('\n✅ Campos preenchidos com sucesso!\n');
    console.log('⚠️  ATENÇÃO: Os valores foram preenchidos mas NÃO SERÃO SALVOS!');
    console.log('🔍 Verifique visualmente se está tudo correto.');
    console.log('⏸️  Aguardando 60 segundos para inspeção...\n');

    await newPage.waitForTimeout(60000);

    console.log('\n❌ Fechando navegador SEM SALVAR...');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Teste finalizado - NADA FOI SALVO!');
  }
}

fillTodayHours();
