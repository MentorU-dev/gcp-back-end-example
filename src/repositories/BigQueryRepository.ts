import { BigQuery } from '@google-cloud/bigquery';

export interface DBRepository<T> {
  create(item: T): Promise<T>;
  get(query: string): Promise<T | null>;
  where(field: string, operator: any, value: string): Promise<T | null>;
  update(id: string, item: T): Promise<T | null>;
  delete(id: string): Promise<void>;
  list(): Promise<T[]>;
  query(query: string, params: Array<any>): Promise<T[]>;
}

export class BaseBigQueryRepository<T> implements DBRepository<T> {
  private tableName: string;
  private bigQuery: BigQuery;

  constructor(tableName: string) {
    try {
      this.tableName = tableName;
      this.bigQuery = new BigQuery();
    } catch (ex) {
      console.log(ex);
    }

  }

  async create(item: T): Promise<T> {
    
    const datasetId = process.env.DATASET;
    const tableId = this.tableName;

    const table = this.bigQuery.dataset(datasetId).table(tableId);
    await table.insert(item);

    return item;
  }

  async get(query: string): Promise<any | null> {
    const response = (await this.bigQuery.query(query))[0];
    return response;
  }
  async where(query: string): Promise<any | null> {
    const response = (await this.bigQuery.query(query))[0];
    return response;
  }
  async update(id: string, item: T): Promise<T | null> {
    // Implement the code to update an item in BigQuery by its ID
    // ...
    return null;
  }

  async delete(id: string): Promise<void> {
    // Implement the code to delete an item from BigQuery by its ID
    // ...
  }

  async list(): Promise<T[]> {
    // Implement the code to list all items in BigQuery
    // ...
    return [];
  }
  async query(query: string, params: Array<any>): Promise<any | null> {
    const response = (await this.bigQuery.query({query, params}))[0];
    return response;
  }
}
