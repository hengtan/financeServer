/**
 * Email de teste - Verificação de Horário
 */

const EmailNotifier = require('./email-notifier');

async function sendTestEmail() {
  const emailNotifier = new EmailNotifier();

  if (!emailNotifier.initialize()) {
    console.log('❌ Erro ao inicializar email');
    return;
  }

  const now = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const time = now.toLocaleTimeString('pt-BR');

  // Email customizado de teste
  const subject = `🧪 TESTE - Verificação de Ponto - ${date}`;

  const body = `
<h2>🧪 TESTE - Verificação de Horário de Saída</h2>

<p><strong>Data:</strong> ${date}</p>
<p><strong>Hora da verificação:</strong> ${time}</p>

<hr>

<h3>✅ Sistema Funcionando Corretamente!</h3>

<p><strong>Atividade Iniciada em:</strong> 06/10/2025 08:55:00</p>

<h3>📊 Cálculo de Saída:</h3>
<ul>
  <li><strong>Entrada Real:</strong> 08:55</li>
  <li><strong>Cálculo:</strong> 08:55 + 9h (8h trabalho + 1h almoço)</li>
  <li><strong>Saída Calculada:</strong> 17:55</li>
</ul>

<h3>⏰ Status Atual:</h3>
<ul>
  <li><strong>Hora atual:</strong> ${time}</li>
  <li><strong>Deve bater saída agora?</strong> ❌ NÃO</li>
  <li><strong>Motivo:</strong> Ainda não chegou a hora (faltam 7h29min)</li>
</ul>

<hr>

<h3>🎯 O que vai acontecer:</h3>
<ol>
  <li><strong>17:00:</strong> Sistema executa verificação e agenda batida para 17:55</li>
  <li><strong>17:55:</strong> Sistema bate saída automaticamente</li>
  <li><strong>17:55:</strong> Atualiza Montreal com horários do dia</li>
  <li><strong>17:55:</strong> Envia email de confirmação</li>
</ol>

<hr>

<p style="color: gray; font-size: 12px;">
🧪 Este é um email de TESTE do sistema de automação de ponto<br>
Enviado em: ${time}
</p>
  `.trim();

  try {
    const mailOptions = {
      from: `"Sistema de Ponto (TESTE)" <henglords7@gmail.com>`,
      to: 'hengtan@live.com',
      subject: subject,
      html: body
    };

    console.log('\n📧 Enviando email de teste...\n');

    const info = await emailNotifier.transporter.sendMail(mailOptions);

    console.log('✅ Email enviado com sucesso!');
    console.log(`   Message ID: ${info.messageId}\n`);
    console.log('📬 Verifique sua caixa de entrada em hengtan@live.com\n');

  } catch (err) {
    console.error('❌ Erro ao enviar email:', err.message);
  }
}

sendTestEmail();
