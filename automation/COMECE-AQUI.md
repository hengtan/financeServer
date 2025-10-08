# 🚀 COMECE AQUI - Instalação Rápida

## 📦 Instalação Automática (RECOMENDADO)

### Windows

**Opção 1: Mais Simples (Duplo-clique)**
```
1. Clique direito em: INSTALAR.bat
2. Escolha: "Executar como administrador"
3. Siga as instruções na tela
```

**Opção 2: PowerShell**
```powershell
1. Clique direito em: install-auto.ps1
2. Escolha: "Executar com PowerShell"
3. Siga as instruções na tela
```

### ⚡ O que o instalador faz automaticamente:

✅ Detecta se Node.js está instalado
✅ Se não estiver, oferece instalar automaticamente
✅ Instala todas as dependências (npm, playwright)
✅ Verifica se tudo está funcionando
✅ Opcionalmente configura login + 2FA
✅ Opcionalmente cria tarefas agendadas

**Tempo total: ~10-15 minutos**

---

## 📋 Instalação Manual (Alternativa)

Se preferir instalar manualmente, siga: `INSTALL-WINDOWS.md`

---

## ✅ Após a Instalação

### Verificar se está tudo OK:
```cmd
node verify-system.js
```

Deve mostrar: `✅ SISTEMA PRONTO PARA USO!`

### Ver feriados cadastrados:
```cmd
node manage-holidays.js list 2025
```

### Adicionar feriado personalizado:
```cmd
node manage-holidays.js add 2025-12-24 "Véspera de Natal"
```

### Teste manual (não salva nada):
```cmd
node run-timesheet.js
```

---

## 🎯 Próxima Execução

O sistema executará automaticamente:
- **8:50** (seg-sex) - Batida de entrada
- **18:00** (seg-sex) - Batida de saída + Montreal

---

## 🔧 Controles

### Desabilitar por 1 dia:
1. Abra `config.json`
2. Mude: `"skipToday": true`
3. No dia seguinte, volte para `false`

### Desabilitar permanentemente:
1. Abra `config.json`
2. Mude: `"enabled": false`

---

## 📊 Logs

Todos os logs ficam em: `logs/`

**Ver log de hoje:**
```cmd
type logs\timesheet-2025-10-06.log
```

**Ver apenas erros:**
```cmd
type logs\errors-2025-10-06.log
```

---

## ❓ Problemas?

### "Node não é reconhecido"
**Solução:** Execute o `INSTALAR.bat` novamente

### "Sessão expirou"
**Solução:**
```cmd
node prodesp-save-session.js
```

### Script não executa
**Verifique:**
```cmd
node checkWorkday.js
```

Se for feriado/fim de semana, é normal não executar.

---

## 📚 Documentação Completa

- `RESUMO-SISTEMA.md` - Resumo técnico completo
- `INSTALL-WINDOWS.md` - Guia instalação manual
- `CHECKLIST-INSTALACAO.txt` - Checklist passo a passo

---

## 🎉 Instalação Concluída?

Se o instalador mostrou **"✅ INSTALAÇÃO COMPLETA!"**, você está pronto!

O sistema executará automaticamente a partir de amanhã (se for dia útil).

**Monitore a primeira execução nos logs!**

---

## 🔒 Arquivos Importantes (NÃO DELETAR!)

- `prodesp-session.json` - Sua sessão salva
- `config.json` - Configurações
- `holidays.json` - Feriados
- `logs/` - Pasta de logs

---

## 📞 Suporte

Veja os logs de erro em: `logs/errors-*.log`
