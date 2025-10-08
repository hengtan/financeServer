# 📅 Tarefas Automáticas - Windows Task Scheduler

## 🎯 O instalador cria AUTOMATICAMENTE estas tarefas:

---

## 📍 **Tarefa 1: Ponto Automático - Entrada**

**Quando executa:** Segunda a Sexta, **8:50**

**O que faz:**
1. Verifica se é dia útil (não executa feriados)
2. Acessa site da Prodesp
3. Login automático (sessão salva, sem 2FA)
4. Clica em "Apontamento de Atividades"
5. Seleciona "Atividades de Desenvolvimento"
6. Clica em **"Iniciar Atividade"**
7. Calcula horários aleatórios do dia:
   - Entrada: random 8:50-9:05
   - Almoço: random 12:20-12:30 (duração EXATA 1h)
   - Saída: calculada para completar 8h trabalho
8. Salva horários em `horarios-do-dia.txt`
9. 📧 Envia email: "Ponto batido para o dia: DD/MM/AAAA"

**Arquivo executado:** `run-timesheet.js`

**Executa mesmo bloqueado:** ✅ SIM (tarefa com /RU SYSTEM)

---

## 📍 **Tarefa 2: Ponto Automático - Agendar Saída**

**Quando executa:** Segunda a Sexta, **17:00**

**O que faz:**
1. Acessa site da Prodesp
2. Clica em "Apontamento de Atividades"
3. Lê horário REAL em "Atividade Iniciada em: DD/MM/AAAA HH:MM:SS"
4. **Exemplo:** Lê "06/10/2025 08:55:00"
5. Calcula saída: 08:55 + 9h (8h trabalho + 1h almoço) = **17:55**
6. Se passar de 18:05, limita a 18:05
7. **Cria dinamicamente** a Tarefa 3 para o horário calculado (ex: 17:55)
8. Atualiza arquivo `daily-times.json` com horário real

**Arquivo executado:** `schedule-exit.js`

**Executa mesmo bloqueado:** ✅ SIM (tarefa com /RU SYSTEM)

---

## 📍 **Tarefa 3: Ponto Automático - Saída Hoje**

**Quando executa:** Criada DINAMICAMENTE no horário calculado

**Exemplo:** Se entrada foi 08:55, executa às **17:55** (mesma segunda-feira)

**O que faz:**
1. Verifica se está no horário correto (±5min)
2. Acessa site da Prodesp
3. Clica em "Apontamento de Atividades"
4. Seleciona "Atividades de Desenvolvimento"
5. Clica em **"Finalizar Atividade"**
6. Acessa site do Montreal
7. Preenche horários do arquivo `horarios-do-dia.txt`:
   - Ent1: 08:55 (entrada real lida do site)
   - Sai1: 12:24 (almoço início)
   - Ent2: 13:24 (almoço fim - exatamente +1h)
   - Sai2: 17:55 (saída calculada)
8. Clica em "Salvar"
9. Clica em "Atualizar"
10. Verifica se salvou corretamente
11. 📧 Envia email: "Ponto batido para o dia: DD/MM/AAAA - COMPLETO"

**Arquivo executado:** `run-timesheet.js`

**Executa mesmo bloqueado:** ✅ SIM (tarefa com /RU SYSTEM)

**Importante:** Esta tarefa é **recriada todos os dias** no horário correto!

---

## 🔄 **Fluxo Completo de um Dia:**

```
┌─────────────────────────────────────────────────────────┐
│ Segunda-feira                                           │
└─────────────────────────────────────────────────────────┘

⏰ 08:50 → Tarefa 1 executa
           ├─ Bate entrada na Prodesp (Iniciar)
           ├─ Calcula horários random
           ├─ Salva em horarios-do-dia.txt
           └─ 📧 Email: "Entrada registrada"

⏰ 17:00 → Tarefa 2 executa
           ├─ Lê entrada real: 08:55
           ├─ Calcula saída: 17:55
           ├─ Cria Tarefa 3 para 17:55
           └─ Aguarda...

⏰ 17:55 → Tarefa 3 executa (criada dinamicamente)
           ├─ Bate saída na Prodesp (Finalizar)
           ├─ Atualiza Montreal com horários do TXT
           └─ 📧 Email: "Saída + Montreal OK"

✅ DIA COMPLETO!
```

---

## 🛡️ **Proteções do Sistema:**

✅ Não executa fins de semana
✅ Não executa feriados (2025 e 2026 já cadastrados)
✅ Verifica se já executou (evita duplicação)
✅ Só bate saída se entrada foi registrada
✅ Só bate saída no horário correto (±5min)
✅ Limita saída máxima às 18:05
✅ Logs completos de tudo
✅ Email de erro se algo falhar

---

## 📂 **Onde visualizar as tarefas:**

1. Tecle `Win + R`
2. Digite: `taskschd.msc`
3. Enter
4. Procure: **"Ponto Automático"**

Você verá as 2 tarefas fixas:
- ✅ Ponto Automático - Entrada
- ✅ Ponto Automático - Agendar Saída

E quando chegar às 17h, verá a 3ª:
- ✅ Ponto Automático - Saída Hoje

---

## ⚙️ **Todas executam com:**

- `/RU SYSTEM` = Roda mesmo com PC bloqueado
- `/RL HIGHEST` = Privilégios elevados
- `/SC WEEKLY` = Segunda a Sexta
- `/D MON,TUE,WED,THU,FRI` = Seg-Sex

---

## 🎉 **Instalação:**

```cmd
Duplo-clique: INSTALAR.bat (como admin)
```

O instalador cria TUDO automaticamente! 🚀
