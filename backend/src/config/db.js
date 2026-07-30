const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database/inventario.db');
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath);

// Initialize DB schema if it doesn't exist
if (!dbExists) {
  console.log('Base de datos SQLite no encontrada. Inicializando...');
  const schemaPath = path.resolve(__dirname, '../../database/schema_sqlite.sql');
  const seedsPath = path.resolve(__dirname, '../../database/seeds.sql');
  
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedsSql = fs.readFileSync(seedsPath, 'utf8');
  
  db.serialize(() => {
    // Run schema
    db.exec(schemaSql, (err) => {
      if (err) {
        console.error('Error al inicializar el esquema SQLite:', err);
      } else {
        console.log('Esquema SQLite inicializado con éxito.');
        // Run seeds
        db.exec(seedsSql, (errSeeds) => {
          if (errSeeds) {
            console.error('Error al cargar datos de prueba (seeds):', errSeeds);
          } else {
            console.log('Datos de prueba cargados con éxito.');
          }
        });
      }
    });
  });
}

const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    // Replace $1, $2, etc. with ? for SQLite
    let sql = text.replace(/\$(\d+)/g, '?');
    
    // Remove FOR UPDATE
    sql = sql.replace(/\s*FOR\s+UPDATE\s*/gi, ' ');
    
    // Execute query
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error ejecutando query:', sql, 'params:', params, err);
        return reject(err);
      }
      resolve({ rows: rows || [] });
    });
  });
};

const getClient = async () => {
  return {
    query: async (text, params) => query(text, params),
    release: () => {}
  };
};

module.exports = { query, getClient };

