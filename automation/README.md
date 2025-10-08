# 🤖 Automação de Ponto - Prodesp & Montreal

Sistema completo de automação de registro de ponto para os portais Prodesp e Montreal.

## 📋 Funcionalidades

✅ Verificação automática de dias úteis (fins de semana e feriados)
✅ Batida de ponto automática na Prodesp (entrada e saída)
✅ Seleção automática de "Atividades de Desenvolvimento"
✅ Cálculo inteligente de horários (9h trabalho + 1h almoço com variação)
✅ Atualização automática do Montreal com os horários
✅ Sistema de sessão para evitar 2FA repetido

## 🚀 Configuração Inicial

### 1. Instalar dependências
```bash
npm install
npx playwright install chromium
```

### 2. Salvar sessão Microsoft (apenas uma vez)
```bash
node prodesp-save-session.js
```
**Importante:** Você precisará aprovar o 2FA no celular durante esta execução. A sessão será salva e não precisará mais do 2FA.

### 3. Testar scripts individuais (opcional)
```bash
# Testar login Prodesp
node prodesp-with-session.js

# Testar login Montreal
node montreal-complete.js
```

## 📅 Gerenciamento de Feriados

### Verificar se hoje é dia útil
```bash
node checkWorkday.js
# ou
node manage-holidays.js check
```

### Verificar data específica
```bash
node manage-holidays.js check 2025-12-25
```

### Listar feriados do ano
```bash
node manage-holidays.js list 2025
```

### Adicionar feriado manual
```bash
node manage-holidays.js add 2025-12-24 "Véspera de Natal"
```

### Remover feriado manual
```bash
node manage-holidays.js remove 2025-12-24
```

## ⚙️ Uso Diário

### Automático (recomendado)
Configure um cron job ou agendador do sistema para executar:

**Linux/Mac (crontab):**
```bash
# Batida de entrada (8:50)
50 8 * * 1-5 cd /Users/hengtan/Documents/git/financeServer/automation && node daily-timesheet.js

# Batida de saída (18:00)
0 18 * * 1-5 cd /Users/hengtan/Documents/git/financeServer/automation && node daily-timesheet.js
```

**Windows (Task Scheduler):**
- Criar tarefa para executar `node daily-timesheet.js` às 8:50 e 18:00

### Manual
```bash
# Executar fluxo completo do dia
node daily-timesheet.js
```

O script irá:
1. ✅ Verificar se é dia útil
2. ✅ Calcular horários do dia (se ainda não calculado)
3. ✅ Bater ponto de entrada (antes das 10h)
4. ✅ Bater ponto de saída (depois das 17h)
5. ✅ Atualizar Montreal com os horários

## 📂 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `daily-timesheet.js` | Script principal - fluxo completo automático |
| `prodesp-save-session.js` | Salva sessão Microsoft (executar 1x) |
| `prodesp-with-session.js` | Login Prodesp com sessão salva |
| `montreal-complete.js` | Atualização completa Montreal |
| `checkWorkday.js` | Verifica se é dia útil |
| `manage-holidays.js` | Gerencia feriados |
| `holidays.json` | Lista de feriados (nacionais, SP, manuais) |
| `daily-times.json` | Horários calculados por dia |
| `prodesp-session.json` | Sessão Microsoft salva (não commitar!) |

## 🔐 Credenciais

As credenciais estão hardcoded nos scripts. **NÃO commitar arquivos com credenciais!**

Arquivos já ignorados no `.gitignore`:
- `prodesp-session.json`
- `montreal-session.json`
- `daily-times.json`

## 🛠️ Manutenção

### Atualizar feriados para próximo ano
Edite `holidays.json` e adicione os feriados do novo ano seguindo o formato:
```json
"2027": {
  "nacional": [
    { "date": "2027-01-01", "name": "Confraternização Universal" }
  ],
  "estadual": [
    { "date": "2027-07-09", "name": "Revolução Constitucionalista (SP)" }
  ],
  "manual": []
}
```

### Renovar sessão Microsoft
Se a sessão expirar (geralmente após semanas), execute novamente:
```bash
node prodesp-save-session.js
```

## 📊 Lógica de Horários

O sistema calcula automaticamente os horários seguindo as regras:

- **Entrada (Ent1):** Random entre 8:50 e 9:10
- **Saída Almoço (Sai1):** Random entre 12:00 e 13:00 (±15min)
- **Volta Almoço (Ent2):** 1h após saída (±15min)
- **Saída Final (Sai2):** Calculado para completar 9h de trabalho

Exemplo:
- Entrada: 09:05
- Saída almoço: 12:43
- Volta almoço: 13:51
- Saída: 18:33
- **Total trabalho: 9h exatas**

## ❓ Troubleshooting

### "Sessão expirou"
Execute: `node prodesp-save-session.js`

### "Data não encontrada na tabela" (Montreal)
Verifique se a data está no formato correto e se o período está aberto no sistema

### Script não executa em dia útil
Verifique feriados com: `node manage-holidays.js check`

## 📝 Scripts Antigos (Rastreamento)

Os scripts `track:prodesp` e `track:montreal` são apenas para rastreamento de elementos. Use os novos scripts integrados.

## 📄 Licença

Uso pessoal - Henrique Tan
