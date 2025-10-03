#!/usr/bin/env node

/**
 * Gerador de Secrets para Deploy
 *
 * Uso:
 *   node scripts/generate-secrets.js
 *
 * Gera secrets seguros para JWT_SECRET e JWT_REFRESH_SECRET
 */

const crypto = require('crypto');

console.log('\n🔐 Gerando secrets seguros para produção...\n');
console.log('═══════════════════════════════════════════════════════════\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('\n');

console.log('JWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);
console.log('\n');

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✅ Secrets gerados com sucesso!\n');
console.log('📋 Copie esses valores e adicione nas variáveis de ambiente do Render:\n');
console.log('   1. Acesse: Dashboard → finance-backend → Environment');
console.log('   2. Adicione as variáveis acima');
console.log('   3. Salve e faça redeploy\n');
console.log('⚠️  IMPORTANTE: Nunca commite esses valores no Git!\n');
