require('dotenv').config();
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUPS_DIR = path.resolve(__dirname, '../database/backups');
const RETENCION_DIAS = 14;

const respaldar = () => {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivo = path.join(BACKUPS_DIR, `inventario_${timestamp}.sql`);

  const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD };
  const args = [
    '-h', process.env.DB_HOST || 'localhost',
    '-p', process.env.DB_PORT || '5432',
    '-U', process.env.DB_USER || 'postgres',
    '-d', process.env.DB_NAME || 'inventario_db',
    '-f', archivo,
  ];

  execFile('pg_dump', args, { env }, (err) => {
    if (err) {
      console.error('[backup] Error al respaldar la base de datos:', err.message);
      return;
    }
    console.log(`[backup] Respaldo creado: ${archivo}`);
    limpiarRespaldosViejos();
  });
};

const limpiarRespaldosViejos = () => {
  const limite = Date.now() - RETENCION_DIAS * 24 * 60 * 60 * 1000;
  for (const nombre of fs.readdirSync(BACKUPS_DIR)) {
    const ruta = path.join(BACKUPS_DIR, nombre);
    if (fs.statSync(ruta).mtimeMs < limite) fs.unlinkSync(ruta);
  }
};

if (require.main === module) {
  respaldar();
}

module.exports = { respaldar };
