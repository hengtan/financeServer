# ⚡ O QUE ACONTECE AO EXECUTAR INSTALAR.bat

## 🎬 **Fluxo Completo (Passo a Passo Visual)**

---

### **▶️ VOCÊ FAZ:**
```
1. Clica direito em INSTALAR.bat
2. Escolhe "Executar como administrador"
```

---

### **🤖 O SISTEMA FAZ AUTOMATICAMENTE:**

---

## **ETAPA 1: Verificação de Permissões** ✓

```
✅ Verificando permissões de administrador...
✅ Executando como Administrador
```

---

## **ETAPA 2: Node.js** 📦

```
🔍 Verificando se Node.js está instalado...

SE NÃO TIVER:
   ❓ Node.js não encontrado!
   ❓ Deseja instalar automaticamente? (S/N)

   VOCÊ DIGITA: S

   ⬇️  Baixando Node.js v20.x...
   📦 Instalando Node.js...
   ⏳ Aguarde...
   ✅ Node.js instalado com sucesso!

SE JÁ TIVER:
   ✅ Node.js v20.x encontrado!
```

---

## **ETAPA 3: Dependências** 📚

```
📦 Instalando dependências...

⬇️  npm install
   ├── playwright@1.40.0
   ├── nodemailer@6.9.7
   └── (outras dependências...)

⬇️  npx playwright install chromium
   ├── Baixando navegador Chromium...
   └── ✅ Chromium instalado!

✅ Todas as dependências instaladas!
```

---

## **ETAPA 4: Verificação do Sistema** 🔍

```
🔍 Executando 18 verificações...

✅ 1/18  Node.js instalado (v20.x)
✅ 2/18  Versão do Node.js compatível (>=18.0.0)
✅ 3/18  Playwright instalado
✅ 4/18  Navegador Chromium disponível
✅ 5/18  Nodemailer instalado
✅ 6/18  Arquivo config.json existe
✅ 7/18  Arquivo holidays.json existe
✅ 8/18  Arquivo run-timesheet.js existe
✅ 9/18  Arquivo schedule-exit.js existe
✅ 10/18 Arquivo verify-exit-time.js existe
✅ 11/18 Arquivo checkWorkday.js existe
✅ 12/18 Arquivo logger.js existe
✅ 13/18 Arquivo email-notifier.js existe
✅ 14/18 config.json é JSON válido
✅ 15/18 holidays.json é JSON válido
✅ 16/18 Credenciais configuradas
✅ 17/18 Feriados 2025 carregados (10 feriados)
✅ 18/18 Feriados 2026 carregados (10 feriados)

🎉 Todas as verificações passaram!
```

---

## **ETAPA 5: Login e 2FA** 🔐

```
🔐 Salvando sessão Microsoft (para evitar 2FA repetido)...

🌐 Abrindo navegador...
📝 Fazendo login em: tjheng@apoioprodesp.sp.gov.br

⚠️  ATENÇÃO: Abriu no seu celular o Microsoft Authenticator!

VOCÊ FAZ:
   1. Pega o celular
   2. Abre o app Microsoft Authenticator
   3. Aprova a notificação

✅ Login aprovado!
✅ Sessão Microsoft salva em: prodesp-session.json

🔐 Fazendo login na Prodesp...
📝 Usuário: 23294651813
✅ Login Prodesp OK!

✅ Sessão salva com sucesso!
   (Não precisará fazer 2FA novamente!)
```

---

## **ETAPA 6: Agendamentos Windows** 📅

```
📅 Criando tarefas agendadas no Windows...

📝 Criando: Ponto Automático - Entrada
   Horário: 8:50
   Dias: Segunda a Sexta
   ✅ Tarefa criada com /RU SYSTEM (roda mesmo bloqueado)

📝 Criando: Ponto Automático - Agendar Saída
   Horário: 17:00
   Dias: Segunda a Sexta
   ✅ Tarefa criada com /RU SYSTEM (roda mesmo bloqueado)

✅ TAREFAS CRIADAS COM SUCESSO!
```

---

## **ETAPA 7: Email (Opcional)** 📧

```
📧 Deseja configurar notificações por email? (S/N)

VOCÊ DIGITA: S

📖 Siga o guia em: CONFIGURAR-EMAIL.md
   1. Gere senha de aplicativo no Gmail
   2. Edite config.json
   3. Teste: node email-notifier.js

OU VOCÊ DIGITA: N

⏭️  Pulando configuração de email (pode fazer depois)
```

---

## **ETAPA 8: Conclusão** ✅

```
═══════════════════════════════════════════
   INSTALAÇÃO CONCLUÍDA COM SUCESSO!
═══════════════════════════════════════════

✅ Node.js instalado
✅ Dependências instaladas
✅ Sistema verificado (18/18 checks)
✅ Sessão Microsoft salva
✅ Tarefas agendadas criadas

📅 TAREFAS ATIVAS:

  📍 Entrada: Segunda a Sexta, 8:50
      → Bate entrada na Prodesp

  📍 Verificação: Segunda a Sexta, 17:00
      → Lê entrada real e agenda saída

  📍 Saída: Criada dinamicamente
      → Bate saída no horário exato

═══════════════════════════════════════════

🎉 SISTEMA 100% OPERACIONAL!

O sistema agora executará AUTOMATICAMENTE
todos os dias úteis (seg-sex, exceto feriados).

Funciona mesmo com Windows bloqueado!

═══════════════════════════════════════════

📚 PRÓXIMOS PASSOS (OPCIONAL):

1. Configurar email: CONFIGURAR-EMAIL.md
2. Ver tarefas: Win+R → taskschd.msc
3. Ver logs: type logs\timesheet-YYYY-MM-DD.log

═══════════════════════════════════════════

Pressione qualquer tecla para fechar...
```

---

## **🎯 RESUMO: VOCÊ FEZ 2 CLIQUES**

```
1. Clique direito → Executar como administrador
2. Aprovar 2FA no celular (1x só)

RESULTADO: Sistema rodando automaticamente! ✅
```

---

## **📅 A PARTIR DE AMANHÃ:**

### **Segunda-feira, 8:50:**
```
🤖 Sistema acorda sozinho
✅ Bate entrada na Prodesp
✅ Calcula horários do dia
✅ Salva em horarios-do-dia.txt
📧 Envia email (se configurado)
```

### **Segunda-feira, 17:00:**
```
🤖 Sistema verifica
✅ Lê entrada real: 08:55
✅ Calcula saída: 17:55
✅ Agenda batida para 17:55
```

### **Segunda-feira, 17:55:**
```
🤖 Sistema executa
✅ Bate saída na Prodesp
✅ Atualiza Montreal
📧 Envia email de confirmação
```

---

## **🛡️ SEGURANÇA:**

✅ Sessão salva localmente (criptografada pelo Windows)
✅ Não precisa digitar senha toda vez
✅ 2FA aprovado 1x só
✅ Credenciais em config.json (não commitado)
✅ Logs completos de tudo
✅ Sistema só executa dias úteis
✅ Evita duplicação automática

---

## **⚡ INSTALAÇÃO = MÁGICA**

```
ANTES:
   😫 Acordar 8:50 todo dia
   😫 Lembrar de bater ponto
   😫 Calcular horários manualmente
   😫 Preencher Montreal

DEPOIS:
   😴 Dorme tranquilo
   ✅ Sistema faz tudo sozinho
   ✅ Email de confirmação
   ✅ Zero preocupação
```

---

## **🎉 SÓ ISSO!**

```
Copiar pasta → Executar INSTALAR.bat → Aprovar 2FA → PRONTO!
```

**Tempo total:** 5-10 minutos
**Esforço total:** 2 cliques + 1 aprovação no celular
**Resultado:** Sistema rodando para sempre! ♾️

---

🚀 **SIMPLESMENTE EXECUTE E DEIXE A MÁGICA ACONTECER!**
