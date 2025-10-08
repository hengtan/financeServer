# 📦 Instalação no Windows - Automação de Ponto

Guia completo para instalar o sistema de automação no PC Windows.

## 📋 Pré-requisitos

### 1. Node.js (Obrigatório)
- Download: https://nodejs.org/
- Versão mínima: v16
- **Recomendado: v20 LTS**

**Instalação:**
1. Baixe o instalador Windows (.msi)
2. Execute e siga o wizard
3. ✅ Marque "Add to PATH"
4. Reinicie o terminal após instalação

**Verificar:**
```cmd
node --version
npm --version
```

### 2. Git (Opcional, mas recomendado)
- Download: https://git-scm.com/download/win
- Para clonar o repositório

---

## 🚀 Instalação Passo a Passo

### Passo 1: Copiar Arquivos

Copie a pasta `automation` completa para o Windows. Exemplo:
```
C:\Users\SeuUsuario\automation\
```

### Passo 2: Instalar Dependências

Abra o **PowerShell** ou **CMD** na pasta automation:

```cmd
cd C:\Users\SeuUsuario\automation
npm install
```

Aguarde a instalação completar (~2-5 minutos).

### Passo 3: Instalar Playwright

```cmd
npx playwright install chromium
```

Isso vai baixar o navegador Chromium necessário (~100MB).

### Passo 4: Verificar Instalação

```cmd
node verify-system.js
```

Deve mostrar:
```
✅ SISTEMA PRONTO PARA USO!
```

Se mostrar erros, corrija antes de continuar.

---

## ⚙️ Configuração Inicial

### 1. Salvar Sessão Microsoft (IMPORTANTE)

**Execute UMA VEZ:**
```cmd
node prodesp-save-session.js
```

**O que vai acontecer:**
1. Navegador abre automaticamente
2. Faz login na Microsoft
3. **VOCÊ PRECISA APROVAR O 2FA NO CELULAR**
4. Faz login no Prodesp
5. Salva a sessão

**Após esse passo, não precisará mais do 2FA nas próximas execuções!**

### 2. Verificar Feriados

```cmd
node manage-holidays.js list 2025
```

Veja se os feriados estão corretos.

**Adicionar feriado personalizado:**
```cmd
node manage-holidays.js add 2025-12-24 "Véspera de Natal"
```

### 3. Configurar Agendamento Automático (Windows Task Scheduler)

#### Opção A: Script Automático (Recomendado)

Execute como **Administrador**:
```cmd
node setup-windows-tasks.js
```

Isso vai criar 2 tarefas agendadas:
- **Batida Entrada:** 8:50 (seg-sex)
- **Batida Saída:** 18:00 (seg-sex)

#### Opção B: Manual

1. Abra **Task Scheduler** (Agendador de Tarefas)
2. Criar Tarefa Básica
3. Nome: "Ponto - Entrada"
4. Gatilho: Diariamente, 8:50, Seg-Sex
5. Ação: Iniciar Programa
   - Programa: `C:\Program Files\nodejs\node.exe`
   - Argumentos: `run-timesheet.js`
   - Iniciar em: `C:\Users\SeuUsuario\automation`
6. Repetir para "Ponto - Saída" às 18:00

---

## 📊 Arquivos de Configuração

### `config.json`

Configuração principal:

```json
{
  "system": {
    "enabled": true,        // Desabilita todo o sistema
    "skipToday": false      // Pula execução de hoje
  }
}
```

**Para desabilitar por um dia:**
1. Abra `config.json`
2. Mude `"skipToday": false` para `"skipToday": true`
3. No dia seguinte, volte para `false`

### `holidays.json`

Feriados cadastrados. Edite manualmente ou use:
```cmd
node manage-holidays.js add 2025-XX-XX "Nome do Feriado"
```

---

## 🔍 Verificações e Testes

### Verificar Sistema

```cmd
node verify-system.js
```

### Verificar se Hoje é Dia Útil

```cmd
node checkWorkday.js
```

### Teste Manual (SEM SALVAR)

Para testar sem executar de verdade:
```cmd
node run-timesheet.js --dry-run
```
*(Ainda não implementado)*

### Ver Logs

Logs salvos em: `C:\Users\SeuUsuario\automation\logs\`

**Ver log de hoje:**
```cmd
type logs\timesheet-2025-10-06.log
```

**Ver erros:**
```cmd
type logs\errors-2025-10-06.log
```

---

## 🛠️ Manutenção

### Renovar Sessão Microsoft

Se parar de funcionar (sessão expirou):
```cmd
node prodesp-save-session.js
```

### Atualizar Feriados do Próximo Ano

No final do ano, edite `holidays.json` e adicione feriados de 2026.

### Limpar Logs Antigos

Automático! Logs com mais de 30 dias são removidos automaticamente.

---

## ❓ Troubleshooting

### Erro: "node não é reconhecido"

Node.js não está no PATH.
**Solução:** Reinstale Node.js marcando "Add to PATH"

### Erro: "Sessão expirou"

**Solução:** `node prodesp-save-session.js`

### Erro: "playwright not found"

**Solução:** `npm install && npx playwright install chromium`

### Script não executa em dia útil

**Verificar:**
```cmd
node checkWorkday.js
```

Se mostrar feriado incorreto:
```cmd
node manage-holidays.js remove 2025-XX-XX
```

### Verificar se Tarefas Agendadas Estão Ativas

1. Abra **Task Scheduler**
2. Procure "Ponto - Entrada" e "Ponto - Saída"
3. Veja se Status = "Ready"
4. Botão direito → Executar (para testar)

---

## 📁 Estrutura de Arquivos

```
automation/
├── config.json              ← Configurações principais
├── holidays.json            ← Feriados cadastrados
├── run-timesheet.js         ← Script principal
├── verify-system.js         ← Verificação de pré-requisitos
├── checkWorkday.js          ← Verifica dia útil
├── manage-holidays.js       ← Gerencia feriados
├── logger.js                ← Sistema de logs
├── prodesp-save-session.js  ← Salva sessão (executar 1x)
├── prodesp-session.json     ← Sessão salva (NÃO DELETAR!)
├── execution-log.json       ← Log de execuções
├── daily-times.json         ← Horários calculados
└── logs/                    ← Logs diários
    ├── timesheet-2025-10-06.log
    └── errors-2025-10-06.log
```

---

## 🔒 Segurança

**NUNCA** compartilhe estes arquivos:
- `prodesp-session.json` (contém sua sessão)
- `config.json` (contém suas credenciais)
- `daily-times.json`
- `execution-log.json`

**Backup:** Faça backup apenas de `holidays.json`

---

## ✅ Checklist de Instalação

- [ ] Node.js instalado (v16+)
- [ ] Pasta automation copiada
- [ ] `npm install` executado
- [ ] `npx playwright install chromium` executado
- [ ] `node verify-system.js` mostra sucesso
- [ ] `node prodesp-save-session.js` executado (com 2FA)
- [ ] Feriados verificados
- [ ] Tarefas agendadas criadas
- [ ] Teste manual funcionou

---

## 📞 Suporte

Se encontrar problemas, verifique os logs em `logs/errors-*.log`

