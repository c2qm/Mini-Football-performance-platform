import type { DatabaseConnection }
from "../../../core/contracts/DatabaseConnection";


import type {
    Database,
    SqlValue
}
from "sql.js";



export class WebSQLiteConnection
implements DatabaseConnection {


    private db: Database | null = null;


    private readonly databaseName: string;



    constructor(
        databaseName: string
    ){

        this.databaseName = databaseName;

    }




    async open(): Promise<void>{


        if(this.db !== null){

            return;

        }

        try {

            const initSqlJs = (await import('sql.js')).default;

            const SQL =
                await initSqlJs();

            this.db =
                new SQL.Database();

        } catch (error) {

            console.error('Failed to initialize sql.js:', error);

            throw new Error(
                'Failed to initialize web SQLite: ' + String(error)
            );

        }

    }




    async close(): Promise<void>{


        if(this.db === null){

            return;

        }



        this.db.close();


        this.db = null;

    }




    async execute(
        sql: string,
        params: unknown[] = []
    ): Promise<void>{


        const db =
            this.getDatabase();



        db.run(

            sql,

            this.normalizeParams(params)

        );

    }




    async query<T>(
        sql: string,
        params: unknown[] = []
    ): Promise<T[]>{


        const db =
            this.getDatabase();



        const statement =
            db.prepare(sql);



        statement.bind(
            this.normalizeParams(params)
        );



        const rows: T[] = [];



        while(statement.step()){


            const row =
                statement.getAsObject();



            rows.push(
                row as T
            );

        }



        statement.free();



        return rows;

    }




    async transaction(
        callback: () => Promise<void>
    ): Promise<void>{


        const db =
            this.getDatabase();



        try{


            db.run(
                "BEGIN TRANSACTION"
            );



            await callback();



            db.run(
                "COMMIT"
            );


        }
        catch(error){


            db.run(
                "ROLLBACK"
            );


            throw error;

        }

    }




    private getDatabase(): Database{


        if(this.db === null){


            throw new Error(

                `Database "${this.databaseName}" is not open`

            );

        }



        return this.db;

    }




    private normalizeParams(
        params: unknown[]
    ): SqlValue[] {


        return params.map(

            (param) => {


                if(
                    typeof param === "string" ||
                    typeof param === "number" ||
                    param === null
                ){

                    return param;

                }



                if(
                    param instanceof Uint8Array
                ){

                    return param;

                }



                return String(param);

            }

        );

    }


}
