#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const refDir = fs.existsSync(path.join(targetDir, 'references')) 
  ? path.join(targetDir, 'references') 
  : targetDir;

if (!fs.existsSync(refDir)) {
  console.error(`No se encontró el directorio de referencias en: ${refDir}`);
  process.exit(1);
}

const files = fs.readdirSync(refDir).filter(f => f.endsWith('.md'));
console.log(`\n🔍 Verificando vigencia de guías en: ${refDir}\n`);

let hasExpired = false;
const today = new Date();

for (const file of files) {
  const filePath = path.join(refDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const match = content.match(/Última verificación:\*\*\s*(\d{4}-\d{2}-\d{2})\s*·\s*\*\*Revalidar cada:\*\*\s*(\d+)\s*días/i);
  
  if (match) {
    const [, dateStr, maxDaysStr] = match;
    const lastCheck = new Date(dateStr);
    const maxDays = parseInt(maxDaysStr, 10);
    const diffTime = today.getTime() - lastCheck.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remainingDays = maxDays - diffDays;
    
    if (diffDays > maxDays) {
      hasExpired = true;
      console.log(`❌ [VENCIDA] ${file}: Verificada el ${dateStr} hace ${diffDays} días (límite: ${maxDays} días). Excedida por ${Math.abs(remainingDays)} días.`);
    } else {
      console.log(`✅ [VIGENTE] ${file}: Verificada el ${dateStr} hace ${diffDays} días (límite: ${maxDays} días, restan ${remainingDays} días de vigencia).`);
    }
  } else {
    console.log(`ℹ️ [SIN PLAZO] ${file}: No contiene encabezado de vigencia temporal.`);
  }
}

console.log('');
if (hasExpired) {
  console.log('⚠️  Existen guías vencidas. Revalida las fuentes primarias antes de continuar.');
  process.exit(1);
} else {
  console.log('✨ Todas las guías con control de vigencia se encuentran al día.');
  process.exit(0);
}

