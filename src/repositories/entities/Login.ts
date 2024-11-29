

import { BaseBigQueryRepository  } from "../BigQueryRepository";
import dotenv from 'dotenv';

dotenv.config();


export class LoginRepository  {

    private db: BaseBigQueryRepository<any>;

    constructor() {
        this.db = new BaseBigQueryRepository<any>("Login-test");
    }
    
    async create(fields): Promise<any> {
        const loginFields = {
            email: fields.email,
            date: fields.date,
            success: true
        };
        return await this.db.create(loginFields);
    }
}
