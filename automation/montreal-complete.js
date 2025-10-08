/**
 * Script completo - Preenche, Salva, Atualiza e Verifica
 *
 * INSTRUÇÕES DE USO:
 * 1. Configure as datas e horários no array DAYS_TO_FILL abaixo
 * 2. Ajuste a justificativa em JUSTIFICATIVA_GERAL se necessário
 * 3. Execute: node montreal-complete.js
 *
 * O script irá:
 * - Fazer login no portal Montreal
 * - Navegar até Entrada de Batidas
 * - Preencher os horários de cada dia configurado
 * - Salvar os dados
 * - Atualizar a página
 * - Verificar se os dados foram salvos corretamente
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

// Configure aqui os dias e horários que deseja preencher
// Formato da data: 'dd/mm/yyyy'
// Formato das horas: ['Ent1', 'Sai1', 'Ent2', 'Sai2']
const DAYS_TO_FILL = [
  // Exemplo:
  // { date: '04/10/2025', hours: ['09:00', '12:00', '13:00', '18:00'] },
  // { date: '05/10/2025', hours: ['09:15', '12:30', '13:30', '18:15'] },
];

const JUSTIFICATIVA_GERAL = 'Atualizacao do Ponto';

async function completeFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando fluxo completo Montreal\n');

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

    // Nova janela
    const pages = context.pages();
    const newPage = pages[pages.length - 1];

    console.log('\n5️⃣ Preenchendo justificativa...');
    await newPage.fill('#GB_txtJustificativa', JUSTIFICATIVA_GERAL);
    console.log(`   ✅ "${JUSTIFICATIVA_GERAL}"\n`);

    console.log('6️⃣ Preenchendo horários...\n');
    const dateSpans = await newPage.locator('span[id^="GB_l"][id$="_lblData"]').all();

    for (const dayData of DAYS_TO_FILL) {
      console.log(`   📅 ${dayData.date}:`);
      let rowIndex = null;

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

      const fields = ['Ent1', 'Sai1', 'Ent2', 'Sai2'];
      for (let i = 0; i < fields.length && i < dayData.hours.length; i++) {
        const fieldId = `#GB_l${rowIndex}_txt${fields[i]}`;
        await newPage.fill(fieldId, dayData.hours[i]);
        console.log(`      ✅ ${fields[i]}: ${dayData.hours[i]}`);
        await newPage.waitForTimeout(200);
      }
      console.log('');
    }

    console.log('7️⃣ Clicando em SALVAR...');
    await newPage.click('#GB_btnSalvar_tblabel');
    await newPage.waitForTimeout(3000);
    console.log('   ✅ Salvo!\n');

    console.log('8️⃣ Fechando modal (nova janela)...');
    await newPage.close();
    await page.waitForTimeout(1000);
    console.log('   ✅ Modal fechado!\n');

    console.log('9️⃣ Clicando em ATUALIZAR...');
    await page.click('#ctl26_btnAtualizar_tblabel');
    await page.waitForTimeout(3000);
    console.log('   ✅ Atualizado!\n');

    console.log('🔍 Verificando dados inseridos...\n');

    // Verificar cada dia na grid
    for (const dayData of DAYS_TO_FILL) {
      console.log(`   📅 Verificando ${dayData.date}...`);

      // Procurar a linha na tabela principal
      const rows = await page.locator('#ctl26_gridEspelhoCartao_gridEspelhoCartao tr.RowGrid, #ctl26_gridEspelhoCartao_gridEspelhoCartao tr.RowGrid[style*="AliceBlue"]').all();

      for (const row of rows) {
        const rowText = await row.textContent();

        if (rowText.includes(dayData.date)) {
          // Extrair os horários da linha
          const cells = await row.locator('td').all();
          const valores = [];

          // Células 3-6 contêm Ent1, Sai1, Ent2, Sai2
          for (let i = 3; i <= 6; i++) {
            if (i < cells.length) {
              const text = await cells[i].textContent();
              valores.push(text.trim());
            }
          }

          console.log(`      Ent1: ${valores[0] || 'vazio'}`);
          console.log(`      Sai1: ${valores[1] || 'vazio'}`);
          console.log(`      Ent2: ${valores[2] || 'vazio'}`);
          console.log(`      Sai2: ${valores[3] || 'vazio'}`);

          // Verificar se está correto
          let correto = true;
          for (let i = 0; i < 4 && i < dayData.hours.length; i++) {
            if (valores[i] !== dayData.hours[i]) {
              correto = false;
            }
          }

          if (correto) {
            console.log(`      ✅ CORRETO!\n`);
          } else {
            console.log(`      ⚠️  DIFERENTE DO ESPERADO\n`);
          }

          break;
        }
      }
    }

    console.log('✅ Processo completo!\n');
    console.log('⏸️  Aguardando 30 segundos para verificação visual...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n✅ Finalizado!');
  }
}

completeFlow();
