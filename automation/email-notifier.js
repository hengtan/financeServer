/**
 * Sistema de Notificação por Email (GRATUITO)
 *
 * Usa Gmail gratuitamente com senha de aplicativo
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const CONFIG_FILE = path.join(__dirname, 'config.json');

class EmailNotifier {
  constructor() {
    this.config = null;
    this.transporter = null;
  }

  /**
   * Carrega configuração
   */
  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return true;
    } catch (err) {
      logger.error('Erro ao carregar config.json para email', { error: err.message });
      return false;
    }
  }

  /**
   * Inicializa transporter
   */
  initialize() {
    if (!this.loadConfig()) {
      return false;
    }

    if (!this.config.email || !this.config.email.enabled) {
      logger.info('Notificações por email desabilitadas');
      return false;
    }

    const emailConfig = this.config.email;

    // Validar configurações
    if (!emailConfig.from || !emailConfig.password || !emailConfig.to) {
      logger.error('Configurações de email incompletas em config.json');
      return false;
    }

    try {
      // Criar transporter Gmail
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailConfig.from,
          pass: emailConfig.password // Senha de aplicativo do Gmail
        }
      });

      logger.info('Sistema de email inicializado', { from: emailConfig.from, to: emailConfig.to });
      return true;

    } catch (err) {
      logger.error('Erro ao inicializar email', { error: err.message });
      return false;
    }
  }

  /**
   * Envia notificação de sucesso
   */
  async sendSuccess(type, data = {}) {
    if (!this.transporter) {
      logger.warn('Email não configurado, pulando notificação');
      return false;
    }

    const emailConfig = this.config.email;
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');

    let subject = '';
    let body = '';

    if (type === 'entry') {
      subject = `Ponto batido para o dia: ${date}`;
      body = `
<h2>✅ Ponto Batido - Manhã</h2>

<p><strong>Data:</strong> ${date}</p>
<p><strong>Hora:</strong> ${time}</p>

<p><strong>✅ Entrada registrada com sucesso!</strong></p>

<h3>📊 Horários programados para hoje:</h3>
<ul>
  <li><strong>Entrada:</strong> ${data.times?.entry || 'N/A'}</li>
  <li><strong>Saída Almoço:</strong> ${data.times?.lunchStart || 'N/A'}</li>
  <li><strong>Volta Almoço:</strong> ${data.times?.lunchEnd || 'N/A'}</li>
  <li><strong>Saída Final:</strong> ${data.times?.exit || 'N/A'}</li>
</ul>

<hr>
<p style="color: gray; font-size: 12px;">
Sistema de Automação de Ponto<br>
Executado automaticamente às ${time}
</p>
      `.trim();

    } else if (type === 'exit') {
      subject = `Ponto batido para o dia: ${date}`;
      body = `
<h2>✅ Ponto Batido - Tarde (Completo)</h2>

<p><strong>Data:</strong> ${date}</p>
<p><strong>Hora:</strong> ${time}</p>

<h3>📊 Todas as batidas do dia:</h3>
<ul>
  <li><strong>Entrada:</strong> ${data.times?.entry || 'N/A'}</li>
  <li><strong>Saída Almoço:</strong> ${data.times?.lunchStart || 'N/A'}</li>
  <li><strong>Entrada Almoço:</strong> ${data.times?.lunchEnd || 'N/A'}</li>
  <li><strong>Saída Final:</strong> ${data.times?.exit || 'N/A'}</li>
</ul>

<p><strong>✅ Todos os horários registrados com sucesso!</strong></p>

<hr>
<p style="color: gray; font-size: 12px;">
Sistema de Automação de Ponto<br>
Executado automaticamente às ${time}
</p>
      `.trim();

    } else {
      return false;
    }

    try {
      const mailOptions = {
        from: `"Sistema de Ponto" <${emailConfig.from}>`,
        to: emailConfig.to,
        subject: subject,
        html: body
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.success('Email enviado com sucesso', { messageId: info.messageId });
      return true;

    } catch (err) {
      logger.error('Erro ao enviar email', { error: err.message, stack: err.stack });
      return false;
    }
  }

  /**
   * Envia notificação de erro
   */
  async sendError(type, error) {
    if (!this.transporter) {
      return false;
    }

    const emailConfig = this.config.email;
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');

    const subject = `❌ ERRO no Sistema de Ponto - ${date}`;
    const body = `
<h2 style="color: red;">❌ ERRO no Sistema de Ponto</h2>

<p><strong>Data:</strong> ${date}</p>
<p><strong>Hora:</strong> ${time}</p>
<p><strong>Tipo:</strong> ${type}</p>

<h3>⚠️ Detalhes do Erro:</h3>
<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
${error}
</pre>

<p style="color: red;"><strong>⚠️ Ação necessária: Verifique os logs e execute manualmente!</strong></p>

<hr>
<p style="color: gray; font-size: 12px;">
Sistema de Automação de Ponto<br>
Erro detectado às ${time}
</p>
    `.trim();

    try {
      const mailOptions = {
        from: `"Sistema de Ponto" <${emailConfig.from}>`,
        to: emailConfig.to,
        subject: subject,
        html: body
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.success('Email de erro enviado', { messageId: info.messageId });
      return true;

    } catch (err) {
      logger.error('Erro ao enviar email de erro', { error: err.message });
      return false;
    }
  }

  /**
   * Envia notificação de teste
   */
  async sendTest() {
    if (!this.transporter) {
      console.log('❌ Email não configurado');
      return false;
    }

    const emailConfig = this.config.email;
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');

    const subject = `🧪 Teste - Sistema de Ponto - ${date}`;
    const body = `
<h2>🧪 Email de Teste</h2>

<p>Se você recebeu este email, o sistema de notificações está funcionando corretamente!</p>

<p><strong>Data:</strong> ${date}</p>
<p><strong>Hora:</strong> ${time}</p>

<h3>✅ Configurações:</h3>
<ul>
  <li><strong>De:</strong> ${emailConfig.from}</li>
  <li><strong>Para:</strong> ${emailConfig.to}</li>
</ul>

<p><strong>✅ Sistema pronto para enviar notificações!</strong></p>

<hr>
<p style="color: gray; font-size: 12px;">
Sistema de Automação de Ponto<br>
Email de teste enviado às ${time}
</p>
    `.trim();

    try {
      const mailOptions = {
        from: `"Sistema de Ponto" <${emailConfig.from}>`,
        to: emailConfig.to,
        subject: subject,
        html: body
      };

      console.log('\n📧 Enviando email de teste...');
      console.log(`   De: ${emailConfig.from}`);
      console.log(`   Para: ${emailConfig.to}\n`);

      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email enviado com sucesso!');
      console.log(`   Message ID: ${info.messageId}\n`);
      console.log('🔍 Verifique sua caixa de entrada!\n');

      return true;

    } catch (err) {
      console.error('❌ Erro ao enviar email:', err.message);
      console.error('\n💡 Dicas:');
      console.error('   - Verifique se a senha de aplicativo está correta');
      console.error('   - Verifique se o email está correto');
      console.error('   - Verifique sua conexão com a internet\n');
      return false;
    }
  }
}

// Se executado diretamente, envia email de teste
if (require.main === module) {
  const notifier = new EmailNotifier();
  if (notifier.initialize()) {
    notifier.sendTest().then(() => {
      console.log('Teste concluído!\n');
    });
  } else {
    console.log('\n❌ Falha ao inicializar sistema de email');
    console.log('   Verifique as configurações em config.json\n');
  }
}

module.exports = EmailNotifier;
