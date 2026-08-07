import { WebSQLiteConnection }
from "../../infrastructure/database/web/WebSQLiteConnection";


import { databaseConfig }
from "../../infrastructure/database/connection/DatabaseConfig";


import { runMigrations }
from "./runMigrations";


import type { DatabaseConnection }
from "../../core/contracts/DatabaseConnection";



let databaseInstance: DatabaseConnection | null = null;



export async function initializeDatabase(): Promise<DatabaseConnection> {

  // Return existing instance if already initialized
  if (databaseInstance !== null) {
    return databaseInstance;
  }

  try {

    const db = new WebSQLiteConnection(
        databaseConfig.name
    );

    await db.open();

    await runMigrations(db);

    databaseInstance = db;

    console.log('Database initialized successfully');

    return db;

  } catch (error) {

    console.error("Database initialization error:", error);

    throw error;

  }

}



export function getDatabaseInstance(): DatabaseConnection {

  if (databaseInstance === null) {

    throw new Error(
      'Database not initialized. Call initializeDatabase() first.'
    );

  }

  return databaseInstance;

}
