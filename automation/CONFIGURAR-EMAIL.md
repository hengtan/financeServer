# 📧 Configurar Notificações por Email (GRATUITO)

O sistema pode enviar emails automáticos avisando quando o ponto foi batido!

**Totalmente GRATUITO usando seu Gmail!**

---

## 📋 Passo a Passo

### 1. Gerar Senha de Aplicativo do Gmail

#### Opção A: Gmail Normal

1. Acesse: https://myaccount.google.com/
2. Clique em **"Segurança"** (no menu lateral)
3. Role até **"Como fazer login no Google"**
4. Clique em **"Verificação em duas etapas"**
   - Se não estiver ativada, **ATIVE PRIMEIRO!**
5. Role até o final e clique em **"Senhas de app"**
6. Você verá uma tela para criar senha de app:
   - **Selecionar app:** Escolha "Email"
   - **Selecionar dispositivo:** Escolha "Computador Windows"
7. Clique em **"Gerar"**
8. **COPIE A SENHA DE 16 DÍGITOS** (sem espaços)
   - Exemplo: `abcd efgh ijkl mnop` → copie `abcdefghijklmnop`

#### Opção B: Se não encontrar "Senhas de app"

1. Acesse diretamente: https://myaccount.google.com/apppasswords
2. Faça login se solicitado
3. Siga os passos 6-8 acima

---

### 2. Configurar no Sistema

Edite o arquivo `config.json`:

```json
{
  "email": {
    "enabled": true,                    ← Mude para true
    "from": "seuemail@gmail.com",       ← Seu Gmail
    "password": "abcdefghijklmnop",     ← Senha de 16 dígitos
    "to": "emaildestino@gmail.com"      ← Email que vai receber (pode ser o mesmo)
  }
}
```

**Exemplo Real:**
```json
{
  "email": {
    "enabled": true,
    "from": "hengtan@gmail.com",
    "password": "xpto1234abcd5678",
    "to": "hengtan@gmail.com"
  }
}
```

---

### 3. Testar

Execute o teste de email:

```cmd
node email-notifier.js
```

**Se funcionar, você vai receber um email de teste!**

---

## 🔔 O que você vai receber

### Email de ENTRADA (8:50)
```
Assunto: ✅ Ponto Registrado - ENTRADA - 06/10/2025

Batida de Ponto - ENTRADA
Data: 06/10/2025
Hora: 08:52:15

Horários do Dia:
• Entrada: 09:05
• Saída Almoço: 12:30
• Volta Almoço: 13:30
• Saída Final: 18:35

✅ Entrada registrada com sucesso na Prodesp!
```

### Email de SAÍDA (18:00)
```
Assunto: ✅ Ponto Registrado - SAÍDA - 06/10/2025

Batida de Ponto - SAÍDA
Data: 06/10/2025
Hora: 18:02:45

Resumo do Dia:
• Entrada: 09:05
• Saída Almoço: 12:30
• Volta Almoço: 13:30
• Saída Final: 18:35

✅ Saída registrada na Prodesp!
✅ Montreal atualizado com sucesso!
```

### Email de ERRO (se algo falhar)
```
Assunto: ❌ ERRO no Sistema de Ponto - 06/10/2025

⚠️ ERRO no Sistema de Ponto
Data: 06/10/2025
Tipo: Batida de entrada

Detalhes do Erro:
[Informações técnicas do erro]

⚠️ Ação necessária: Verifique os logs e execute manualmente!
```

---

## ❓ Problemas Comuns

### "Senha incorreta"
**Solução:** Você está usando a senha NORMAL do Gmail. Use a **senha de aplicativo** de 16 dígitos!

### "Não consigo gerar senha de app"
**Solução:** Você precisa ativar a **Verificação em Duas Etapas** primeiro!

### "Não recebo o email"
**Soluções:**
1. Verifique a caixa de **SPAM**
2. Aguarde 1-2 minutos (pode demorar)
3. Verifique se o email `to` está correto no `config.json`

### "Invalid login"
**Solução:**
1. Certifique-se que copiou a senha SEM ESPAÇOS
2. Certifique-se que o email está correto
3. Tente gerar uma nova senha de aplicativo

---

## 🔒 Segurança

### É seguro?

✅ **SIM!** A senha de aplicativo:
- Só funciona para enviar emails
- Não dá acesso à sua conta completa
- Você pode revogar a qualquer momento
- É específica para este aplicativo

### Como revogar?

1. Acesse: https://myaccount.google.com/apppasswords
2. Encontre a senha que você criou
3. Clique em **"Remover"**

Pronto! A senha para de funcionar imediatamente.

---

## 💡 Dicas

### Usar Gmail diferente

Você pode criar um Gmail **só para isso**:
1. Crie uma conta nova no Gmail (gratuito)
2. Use essa conta em `email.from`
3. Configure para enviar para seu email principal em `email.to`

### Desabilitar temporariamente

No `config.json`, mude:
```json
"enabled": false
```

### Enviar para vários emails

No `config.json`:
```json
"to": "email1@gmail.com, email2@gmail.com"
```

---

## ✅ Checklist

- [ ] Verificação em duas etapas ativada no Gmail
- [ ] Senha de aplicativo gerada (16 dígitos)
- [ ] `config.json` configurado
  - [ ] `email.enabled = true`
  - [ ] `email.from` com seu Gmail
  - [ ] `email.password` com senha de 16 dígitos
  - [ ] `email.to` com email destino
- [ ] Teste executado: `node email-notifier.js`
- [ ] Email de teste recebido ✅

---

## 🎯 Pronto!

Quando o sistema executar automaticamente, você receberá emails confirmando que tudo funcionou!

**Sem custo, sem limites, totalmente gratuito!** 🎉
