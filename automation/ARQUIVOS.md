# 📁 Índice de Arquivos

## 🚀 COMECE POR AQUI

| Arquivo | Descrição |
|---------|-----------|
| **LEIA-ME.txt** | **👈 LEIA PRIMEIRO!** Visão geral rápida |
| **INSTALAR.bat** | **👈 EXECUTE ISTO!** Instalador automático (duplo-clique) |
| **COMECE-AQUI.md** | Guia rápido de instalação e uso |

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Documentação geral do sistema |
| `INSTALL-WINDOWS.md` | Guia detalhado de instalação manual |
| `RESUMO-SISTEMA.md` | Documentação técnica completa |
| `CHECKLIST-INSTALACAO.txt` | Lista de verificação passo a passo |
| `ARQUIVOS.md` | Este arquivo - índice de todos os arquivos |

---

## 🔧 Scripts de Instalação

| Arquivo | Descrição |
|---------|-----------|
| `install-auto.ps1` | Script PowerShell de instalação automática |
| `INSTALAR.bat` | Atalho para executar install-auto.ps1 |
| `setup-windows-tasks.js` | Configura agendamento no Windows |
| `verify-system.js` | Verifica pré-requisitos e instalação |

---

## ⚙️ Scripts Principais

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| `run-timesheet.js` | **SCRIPT PRINCIPAL** - Automação completa | Executado automaticamente ou manual |
| `prodesp-save-session.js` | Salva sessão Microsoft (2FA) | **Executar 1 VEZ** após instalação |
| `prodesp-with-session.js` | Login Prodesp com sessão salva | Usado internamente |
| `montreal-complete.js` | Atualização Montreal | Usado internamente |

---

## 📦 Módulos do Sistema

| Arquivo | Descrição |
|---------|-----------|
| `logger.js` | Sistema de logs |
| `checkWorkday.js` | Verifica se é dia útil |
| `manage-holidays.js` | Gerenciador de feriados |

---

## ⚙️ Configuração

| Arquivo | Descrição | Pode editar? |
|---------|-----------|--------------|
| `config.json` | Configurações principais | ✅ SIM |
| `holidays.json` | Feriados cadastrados | ✅ SIM |
| `package.json` | Dependências npm | ❌ NÃO |

---

## 💾 Dados (Gerados automaticamente)

| Arquivo | Descrição | Commitar? |
|---------|-----------|-----------|
| `prodesp-session.json` | Sessão Microsoft salva | ❌ NÃO |
| `execution-log.json` | Log de execuções | ❌ NÃO |
| `daily-times.json` | Horários calculados | ❌ NÃO |
| `logs/` | Pasta de logs diários | ❌ NÃO |

---

## 🗑️ Scripts Antigos (Ignorar)

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `daily-timesheet.js` | Script antigo | ⚠️ Obsoleto - use `run-timesheet.js` |
| `prodesp-login-test.js` | Script de teste | 🧪 Apenas para desenvolvimento |
| `prodesp-full-login.js` | Script de teste | 🧪 Apenas para desenvolvimento |
| `montreal-*.js` | Scripts de teste | 🧪 Apenas para desenvolvimento |

---

## 📊 Estrutura Esperada Após Instalação

```
automation/
├── 📄 LEIA-ME.txt                ← Leia primeiro!
├── 🚀 INSTALAR.bat               ← Execute isto!
├── 📚 COMECE-AQUI.md
│
├── 📁 Documentação/
│   ├── README.md
│   ├── INSTALL-WINDOWS.md
│   ├── RESUMO-SISTEMA.md
│   ├── CHECKLIST-INSTALACAO.txt
│   └── ARQUIVOS.md
│
├── 🔧 Scripts Instalação/
│   ├── install-auto.ps1
│   ├── setup-windows-tasks.js
│   └── verify-system.js
│
├── ⚙️ Scripts Principais/
│   ├── run-timesheet.js          ← PRINCIPAL
│   ├── prodesp-save-session.js   ← Executar 1x
│   ├── prodesp-with-session.js
│   └── montreal-complete.js
│
├── 📦 Módulos/
│   ├── logger.js
│   ├── checkWorkday.js
│   └── manage-holidays.js
│
├── ⚙️ Configuração/
│   ├── config.json               ← Editável
│   ├── holidays.json             ← Editável
│   └── package.json
│
├── 💾 Dados (Gerados)/
│   ├── prodesp-session.json      ← NÃO deletar!
│   ├── execution-log.json
│   ├── daily-times.json
│   └── logs/
│       ├── timesheet-2025-10-06.log
│       └── errors-2025-10-06.log
│
└── 📦 node_modules/              ← Instalado pelo npm
```

---

## ✅ Arquivos Essenciais (NÃO DELETAR!)

Após a instalação, estes arquivos são **ESSENCIAIS**:

1. ✅ `prodesp-session.json` - Sua sessão salva
2. ✅ `config.json` - Configurações
3. ✅ `holidays.json` - Feriados
4. ✅ `run-timesheet.js` - Script principal
5. ✅ `logs/` - Pasta de logs

**Se deletar algum destes, o sistema para de funcionar!**

---

## 🔄 Fluxo de Uso

### 1️⃣ Instalação (Uma vez)
```
INSTALAR.bat → install-auto.ps1 → npm install → playwright install
```

### 2️⃣ Configuração Inicial (Uma vez)
```
prodesp-save-session.js → Aprova 2FA → Salva sessão
```

### 3️⃣ Agendamento (Uma vez)
```
setup-windows-tasks.js → Cria tarefas no Windows
```

### 4️⃣ Execução Diária (Automático)
```
8:50 → run-timesheet.js → Batida entrada
18:00 → run-timesheet.js → Batida saída + Montreal
```

---

## 📝 Comandos Úteis

### Verificações
```cmd
node verify-system.js              # Verifica tudo
node checkWorkday.js               # É dia útil?
node manage-holidays.js list       # Lista feriados
```

### Gerenciamento
```cmd
node manage-holidays.js add 2025-12-24 "Feriado"
node manage-holidays.js remove 2025-12-24
```

### Execução
```cmd
node run-timesheet.js              # Executa manualmente
node prodesp-save-session.js       # Renova sessão
```

### Logs
```cmd
type logs\timesheet-2025-10-06.log
type logs\errors-2025-10-06.log
```

---

## 🎯 Ordem Recomendada de Leitura

1. **LEIA-ME.txt** - Visão geral
2. **COMECE-AQUI.md** - Guia rápido
3. **RESUMO-SISTEMA.md** - Entender como funciona
4. **INSTALL-WINDOWS.md** - Detalhes técnicos (se necessário)

---

## 💡 Dica

**Para novos usuários:**
1. Leia apenas `LEIA-ME.txt`
2. Execute `INSTALAR.bat`
3. Pronto! O resto é automático

**Para usuários avançados:**
Leia `RESUMO-SISTEMA.md` para entender a arquitetura completa.
