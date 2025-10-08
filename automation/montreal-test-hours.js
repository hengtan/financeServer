/**
 * TESTE - Preencher horas SEM SALVAR
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

async function testFillHours() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 TESTE - Preenchimento de horas (SEM SALVAR)\n');

    // Login
    console.log('1️⃣ Fazendo login...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
    await page.fill('#txtUser', CREDENTIALS.username);
    await page.fill('#txtPass', CREDENTIALS.password);
    await page.click('#btnLogin');
    await page.waitForTimeout(3000);

    // Espelho do Cartão
    console.log('2️⃣ Clicando em Espelho do Cartão...');
    await page.click('#ctl18_REC_PtoEspCartaoActionWeb_LinkControl');
    await page.waitForTimeout(2000);

    // Anexos
    console.log('3️⃣ Clicando em Anexos...');
    await page.click('#ctl26_ctl01_ctl01');
    await page.waitForTimeout(1000);

    // Entrada de Batidas
    console.log('4️⃣ Clicando em Entrada de Batidas...');
    await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
    await page.waitForTimeout(3000);

    console.log('\n5️⃣ Procurando campos de hora para 04/10/2025...\n');

    // Procurar todos os inputs de hora visíveis
    const timeInputs = await page.locator('input[type="text"]:visible').all();

    console.log(`Total de campos texto visíveis: ${timeInputs.length}\n`);

    // Listar os primeiros 10 campos para identificar os de hora
    for (let i = 0; i < Math.min(10, timeInputs.length); i++) {
      const input = timeInputs[i];
      const id = await input.getAttribute('id') || 'sem-id';
      const name = await input.getAttribute('name') || '';
      const value = await input.inputValue();

      console.log(`Campo ${i}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Value: "${value}"`);

      // Se o campo parecer ser de hora (vazio ou com formato de hora)
      if (value === '' || value.match(/^\d{2}:\d{2}$/)) {
        console.log(`  ⭐ POSSÍVEL CAMPO DE HORA`);
      }
      console.log('');
    }

    console.log('\n6️⃣ Tentando preencher horas (TESTE - sem salvar)...\n');

    // Estratégia: procurar inputs vazios que aceitem hora
    const emptyInputs = await page.locator('input[type="text"]:visible').all();

    const hours = ['09:00', '12:00', '13:00', '18:00'];
    let filledCount = 0;

    for (const input of emptyInputs) {
      const value = await input.inputValue();
      const id = await input.getAttribute('id') || '';

      // Pular campos que já têm valores como data ou nome
      if (value && !value.match(/^\d{2}:\d{2}$/)) {
        continue;
      }

      // Se for campo vazio e parecer aceitar hora
      if (value === '' && filledCount < hours.length) {
        const hourToFill = hours[filledCount];

        try {
          await input.fill(hourToFill);
          console.log(`✅ Preenchido campo ${id || 'sem-id'} com: ${hourToFill}`);
          filledCount++;
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`❌ Erro ao preencher: ${e.message}`);
        }
      }

      if (filledCount >= hours.length) {
        break;
      }
    }

    console.log(`\n📊 Total de campos preenchidos: ${filledCount}/4\n`);

    console.log('⚠️  ATENÇÃO: Os valores foram preenchidos mas NÃO SERÃO SALVOS!');
    console.log('🔍 Verifique visualmente se os campos estão corretos.');
    console.log('⏸️  Aguardando 60 segundos para inspeção...\n');

    await page.waitForTimeout(60000);

    console.log('\n❌ Fechando navegador SEM SALVAR...');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Teste finalizado - NADA FOI SALVO!');
  }
}

testFillHours();
