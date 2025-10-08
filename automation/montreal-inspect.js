/**
 * Script para inspecionar campos do formulário Montreal
 */

const { chromium } = require('playwright');

const CREDENTIALS = {
  username: '23294651813',
  password: '65ASqw56!@.'
};

async function inspectMontrealForm() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando inspeção Montreal...\n');

    // Login
    console.log('1️⃣ Fazendo login...');
    await page.goto('https://portalrm.montreal.com.br/Corpore.Net/Login.aspx?autoload=false');
    await page.fill('#txtUser', CREDENTIALS.username);
    await page.fill('#txtPass', CREDENTIALS.password);
    await page.click('#btnLogin');
    await page.waitForTimeout(3000);

    // Clicar em Espelho do Cartão primeiro
    console.log('2️⃣ Clicando em Espelho do Cartão...');
    await page.click('#ctl18_REC_PtoEspCartaoActionWeb_LinkControl');
    await page.waitForTimeout(2000);

    // Clicar em Anexos
    console.log('3️⃣ Clicando em Anexos...');
    await page.click('#ctl26_ctl01_ctl01');
    await page.waitForTimeout(1000);

    // Clicar em Entrada de Batidas
    console.log('4️⃣ Clicando em Entrada de Batidas...');
    await page.click('td.DropDownMenuItemTextCell:has-text("Entrada de Batidas")');
    await page.waitForTimeout(3000);

    console.log('\n🔍 INSPECIONANDO FORMULÁRIO:\n');

    // Procurar data de hoje
    const hoje = new Date().toLocaleDateString('pt-BR');
    console.log(`📅 Data de hoje: ${hoje}\n`);

    // Procurar todos os inputs visíveis
    const inputs = await page.locator('input:visible').all();
    console.log(`📝 Total de campos INPUT visíveis: ${inputs.length}\n`);

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const id = await input.getAttribute('id') || 'sem-id';
      const name = await input.getAttribute('name') || 'sem-name';
      const type = await input.getAttribute('type') || 'text';
      const value = await input.inputValue();
      const placeholder = await input.getAttribute('placeholder') || '';

      console.log(`Campo ${i + 1}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Type: ${type}`);
      console.log(`  Value: "${value}"`);
      console.log(`  Placeholder: "${placeholder}"`);
      console.log('');
    }

    // Procurar textareas
    const textareas = await page.locator('textarea:visible').all();
    console.log(`📝 Total de TEXTAREA visíveis: ${textareas.length}\n`);

    for (let i = 0; i < textareas.length; i++) {
      const textarea = textareas[i];
      const id = await textarea.getAttribute('id') || 'sem-id';
      const name = await textarea.getAttribute('name') || 'sem-name';
      const value = await textarea.inputValue();

      console.log(`TextArea ${i + 1}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Value: "${value}"`);
      console.log('');
    }

    // Procurar botões
    const buttons = await page.locator('button:visible, input[type="submit"]:visible, input[type="button"]:visible').all();
    console.log(`🔘 Total de BOTÕES visíveis: ${buttons.length}\n`);

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const id = await button.getAttribute('id') || 'sem-id';
      const text = await button.textContent();
      const value = await button.getAttribute('value') || '';

      console.log(`Botão ${i + 1}:`);
      console.log(`  ID: ${id}`);
      console.log(`  Text: "${text?.trim()}"`);
      console.log(`  Value: "${value}"`);
      console.log('');
    }

    // Procurar se existe texto com data de hoje
    const bodyText = await page.textContent('body');
    if (bodyText.includes(hoje)) {
      console.log(`✅ Data de hoje (${hoje}) ENCONTRADA na página!`);
    } else {
      console.log(`❌ Data de hoje (${hoje}) NÃO encontrada na página`);
    }

    console.log('\n⏸️  Aguardando 60 segundos para inspeção manual...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

inspectMontrealForm();
