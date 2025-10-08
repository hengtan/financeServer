# 🚀 INÍCIO RÁPIDO - Windows

## 📋 **Passo a Passo (5 minutos)**

### **1️⃣ Copie a pasta `automation` para o Windows**

Qualquer lugar serve, exemplo:
```
C:\Users\SeuUsuario\automation\
```

---

### **2️⃣ Execute o instalador**

1. Entre na pasta `automation`
2. Clique com o **botão direito** em: **`INSTALAR.bat`**
3. Escolha: **"Executar como administrador"**

---

### **3️⃣ O instalador faz TUDO sozinho!**

✅ Instala Node.js (se não tiver)
✅ Instala dependências
✅ Verifica tudo
✅ Pede login + 2FA (você aprova no celular **1x só**)
✅ Cria agendamentos automáticos no Windows

---

## 🎯 **Pronto! Sistema Ativo!**

O sistema agora vai executar **automaticamente**:

### **📍 Segunda a Sexta, 8:50:**
- Bate entrada na Prodesp
- Calcula horários do dia (almoço aleatório 12:20-12:30)
- Salva em `horarios-do-dia.txt`
- Envia email ✉️

### **📍 Segunda a Sexta, 17:00:**
- Abre site da Prodesp
- Lê horário REAL de entrada
- Calcula saída (entrada + 9h)
- Agenda batida de saída para o horário exato

### **📍 No horário calculado (ex: 17:55):**
- Bate saída na Prodesp
- Atualiza Montreal com valores do TXT
- Envia email ✉️

---

## ✅ **Funciona mesmo com Windows bloqueado!**

Pode deixar o PC bloqueado que funciona!

---

## 📧 **Email (Opcional):**

Se quiser receber emails de confirmação:

1. Abra: `CONFIGURAR-EMAIL.md`
2. Siga o guia (5 min)
3. Totalmente GRATUITO!

---

## 🎮 **Controles:**

### **Desabilitar por 1 dia:**
Abra `config.json` e mude:
```json
"skipToday": true
```

### **Desabilitar permanente:**
```json
"enabled": false
```

---

## 📂 **Arquivos Importantes:**

- **`INSTALAR.bat`** ← Execute isto!
- **`config.json`** ← Configurações
- **`horarios-do-dia.txt`** ← Horários calculados
- **`logs/`** ← Logs de execução

---

## ❓ **Problemas?**

### **Ver logs:**
```cmd
type logs\timesheet-2025-10-06.log
```

### **Renovar sessão (se expirar):**
```cmd
node prodesp-save-session.js
```

### **Ver tarefas agendadas:**
1. Tecle `Win + R`
2. Digite: `taskschd.msc`
3. Procure: "Ponto Automático"

---

## 🎉 **É SÓ ISSO!**

**Duplo-clique em `INSTALAR.bat` e deixa a mágica acontecer! ✨**

---

## 📋 **Resumo do que acontece:**

```
INSTALAR.bat (como admin)
    ↓
Instala Node.js (se precisar)
    ↓
Instala dependências
    ↓
Login + 2FA (1x só)
    ↓
Cria agendamentos
    ↓
✅ PRONTO!
```

**Agendamentos criados automaticamente:**
1. **Ponto Automático - Entrada** (8:50 Seg-Sex)
2. **Ponto Automático - Agendar Saída** (17:00 Seg-Sex)
3. **Ponto Automático - Saída Hoje** (criado dinamicamente no horário certo)

---

🚀 **Só copiar pasta + executar INSTALAR.bat = Sistema Rodando!**
