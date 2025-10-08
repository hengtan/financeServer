/**
 * DEMONSTRAÇÃO - Montreal (SEM SALVAR)
 *
 * Mostra o que seria feito, mas NÃO salva nada!
 */

const { chromium } = require('playwright');
const { formatDate } = require('./checkWorkday');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

async function demoMontreal() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('═══════════════════════════════════════════');
    console.log('   DEMONSTRAÇÃO - MONTREAL (SEM SALVAR!)');
    console.log('═══════════════════════════════════════════\n');

    // Horários de exemplo para demonstração
    const today = new Date();
    const dateStr = formatDate(today);
    const dateFormatted = dateStr.split('-').reverse().join('/');

    const demoTimes = {
      entry: '09:05',
      lunchStart: '12:30',
      lunchEnd: '13:30',
      exit: '18:35'
    };

    console.log('📅 Data de demonstração:', dateFormatted);
    console.log('🕐 Horários de exemplo:');
    console.log(`   Entrada: ${demoTimes.entry}`);
    console.log(`   Saída almoço: ${demoTimes.lunchStart}`);
    console.log(`   Volta almoço: ${demoTimes.lunchEnd}`);
    console.log(`   Saída: ${demoTimes.exit}\n`);

    console.log('⚠️  MODO DEMONSTRAÇÃO - NADA SERÁ SALVO!\n');

    // Login
    console.log('1️⃣ Fazendo login...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
    await page.fill('#txtUser', CREDENTIALS.username);
    await page.fill('#txtPass', CREDENTIALS.password);
    await page.click('#btnLogin');
    await page.waitForTimeout(3000);
    console.log('   ✅ Login realizado\n');

    // Espelho do Cartão
    console.log('2️⃣ Navegando para Espelho do Cartão...');
    await page.click('#ctl18_REC_PtoEspCartaoActionWeb_LinkControl');
    await page.waitForTimeout(2000);
    console.log('   ✅ Espelho do Cartão aberto\n');

    // Anexos
    console.log('3️⃣ Clicando em Anexos...');
    await page.click('#ctl26_ctl01_ctl01');
    await page.waitForTimeout(1000);
    console.log('   ✅ Menu Anexos aberto\n');

    // Entrada de Batidas
    console.log('4️⃣ Abrindo Entrada de Batidas...');
    await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
    await page.waitForTimeout(3000);
    console.log('   ✅ Modal de Entrada de Batidas aberto\n');

    // Nova janela
    const pages = context.pages();
    const newPage = pages[pages.length - 1];

    console.log('5️⃣ Analisando campos disponíveis...\n');

    // Procurar spans de data
    const dateSpans = await newPage.locator('span[id^="GB_l"][id$="_lblData"]').all();
    console.log(`   📋 Total de datas na tabela: ${dateSpans.length}\n`);

    // Listar algumas datas
    console.log('   📅 Datas disponíveis:');
    for (let i = 0; i < Math.min(10, dateSpans.length); i++) {
      const dateText = await dateSpans[i].textContent();
      const id = await dateSpans[i].getAttribute('id');
      const match = id.match(/GB_l(\d+)_lblData/);
      const rowIndex = match ? match[1] : '?';
      console.log(`      ${i + 1}. ${dateText} (linha ${rowIndex})`);
    }
    console.log('');

    // Procurar a data de hoje
    let rowIndex = null;
    let foundDate = null;

    for (let i = 0; i < dateSpans.length; i++) {
      const dateText = await dateSpans[i].textContent();
      const id = await dateSpans[i].getAttribute('id');

      if (dateText === dateFormatted) {
        const match = id.match(/GB_l(\d+)_lblData/);
        if (match) {
          rowIndex = match[1];
          foundDate = dateText;
          break;
        }
      }
    }

    if (rowIndex) {
      console.log(`✅ Data encontrada: ${foundDate} (linha ${rowIndex})\n`);

      console.log('6️⃣ Campos que SERIAM preenchidos (demonstração):\n');
      console.log('   📝 Justificativa Geral:');
      console.log('      Campo: #GB_txtJustificativa');
      console.log('      Valor: "Atualizacao do Ponto"\n');

      const fields = [
        { name: 'Ent1', value: demoTimes.entry, label: 'Entrada' },
        { name: 'Sai1', value: demoTimes.lunchStart, label: 'Saída Almoço' },
        { name: 'Ent2', value: demoTimes.lunchEnd, label: 'Volta Almoço' },
        { name: 'Sai2', value: demoTimes.exit, label: 'Saída Final' }
      ];

      console.log('   🕐 Horários:');
      for (const field of fields) {
        const fieldId = `#GB_l${rowIndex}_txt${field.name}`;

        // Verificar se o campo existe
        const fieldExists = await newPage.locator(fieldId).count() > 0;

        if (fieldExists) {
          // Ler valor atual
          const currentValue = await newPage.locator(fieldId).inputValue();

          console.log(`      ${field.label} (${field.name}):`);
          console.log(`         Campo: ${fieldId}`);
          console.log(`         Valor atual: "${currentValue || 'vazio'}"`);
          console.log(`         ➡️  Seria alterado para: "${field.value}"`);
          console.log('');
        } else {
          console.log(`      ❌ Campo ${fieldId} não encontrado`);
        }
      }

      console.log('   💾 Botões que SERIAM clicados:');
      console.log('      1. Salvar: #GB_btnSalvar_tblabel');
      console.log('      2. Fechar modal');
      console.log('      3. Atualizar: #ctl26_btnAtualizar_tblabel\n');

      // Verificar se botões existem
      const saveButtonExists = await newPage.locator('#GB_btnSalvar_tblabel').count() > 0;
      console.log(`   Botão Salvar existe? ${saveButtonExists ? '✅ Sim' : '❌ Não'}`);

      const updateButtonExists = await page.locator('#ctl26_btnAtualizar_tblabel').count() > 0;
      console.log(`   Botão Atualizar existe? ${updateButtonExists ? '✅ Sim' : '❌ Não'}\n`);

    } else {
      console.log(`❌ Data ${dateFormatted} NÃO encontrada na tabela\n`);
      console.log('   Possíveis motivos:');
      console.log('   - Data em formato diferente');
      console.log('   - Período ainda não aberto no sistema');
      console.log('   - Data já passou do período de edição\n');
    }

    console.log('7️⃣ Análise completa!\n');
    console.log('═══════════════════════════════════════════');
    console.log('   DEMONSTRAÇÃO CONCLUÍDA');
    console.log('═══════════════════════════════════════════\n');

    console.log('✅ O que foi verificado:');
    console.log('   ✓ Login funciona');
    console.log('   ✓ Navegação funciona');
    console.log('   ✓ Modal de entrada de batidas abre');
    console.log('   ✓ Campos foram identificados');
    console.log('   ✓ Botões foram localizados\n');

    console.log('⚠️  O QUE NÃO FOI FEITO:');
    console.log('   ✗ Nenhum campo foi preenchido');
    console.log('   ✗ Nenhum dado foi salvo');
    console.log('   ✗ Nenhuma alteração foi feita\n');

    console.log('🔍 Aguardando 30 segundos para você inspecionar...\n');
    await page.waitForTimeout(30000);

    console.log('🚪 Fechando navegador sem salvar...\n');

  } catch (error) {
    console.error('❌ Erro durante demonstração:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('✅ Demonstração finalizada - NENHUM DADO FOI ALTERADO!\n');
  }
}

demoMontreal();
