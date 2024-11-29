import { Pool } from 'pg';
import { validateSQL } from '../tools/Validation';


export class BasePostgresRepository<T> {
    private pool: Pool;
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
        if (!this.pool) {
            this.initializePool();
        }
    }
    private initializePool() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432'),
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }

    private async checkConnection(): Promise<void> {
        try {
            await this.pool.query('SELECT 1');
        } catch (error) {
            console.error('Connection check failed, reinitializing pool...', error);
            this.initializePool();
        }
    }
    async create(item: T, id?: string): Promise<T> {
        const filteredKeys = Object.keys(item).filter(key => item[key] !== null && item[key] !== undefined);
        const filteredValues = filteredKeys.map(key => item[key]);
    
        const columns = filteredKeys.map(key => `"${key}"`).join(', ');
        const placeholders = filteredValues.map((_, index) => `$${index + 1}`).join(', ');
    
        const query = `INSERT INTO "${this.tableName}" (${columns}) VALUES (${placeholders}) RETURNING *;`;
        
        await this.checkConnection(); 
        const result  = await this.pool.query(query, filteredValues);
        return result.rows[0];
    }

    async get(id: string): Promise<T | null> {

        const query = `SELECT * FROM "${this.tableName}" WHERE id = $1;`;
        await this.checkConnection();
        const result  = await this.pool.query(query, [id]);

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async update(id: string, item: T): Promise<T | null> {

        let setClause = Object.keys(item).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        const query = `UPDATE "${this.tableName}" SET ${setClause} WHERE id = $1 RETURNING *;`;

        const values = [id, ...Object.values(item)];
        await this.checkConnection();
        const result  = await this.pool.query(query, values);

        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async delete(id: string): Promise<void> {
        await this.checkConnection();
        const query = `DELETE FROM "${this.tableName}" WHERE id = $1;`;
        await this.pool.query(query, [id]);
    }

    async list(): Promise<T[]> {
        await this.checkConnection();
        const query = `SELECT * FROM "${this.tableName}";`;
        const result  = await this.pool.query(query);

        return result.rows;
    }

    async where(field: string, operator: string, value: string): Promise<Array<T>> {

        const isSQLInjection = validateSQL(value);
        if (isSQLInjection.length > 0) {
            throw new Error(JSON.stringify(isSQLInjection))
        }
        await this.checkConnection();
        const query = `SELECT * FROM "${this.tableName}" WHERE "${field}" ${operator} $1;`;
        
        const result= await this.pool.query(query, [value]);
        return result.rows;
    }
    async query(query: string, params: Array<any>): Promise<any | null> {

        params.forEach(p => {
            const isSQLInjection = validateSQL(p.toString());
            if (isSQLInjection.length > 0) {
                throw new Error(JSON.stringify(isSQLInjection))
            }
        });
        await this.checkConnection();
        const result  = (await this.pool.query(query, params));
        return result.rows;
    }
}
