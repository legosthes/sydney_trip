declare module "sql.js" {
  interface Database {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string, params?: unknown[]): { columns: string[]; values: unknown[][] }[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  interface Statement {
    run(params?: unknown[]): void;
    free(): void;
  }

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  interface InitConfig {
    locateFile?: (file: string) => string;
  }

  export type { Database, Statement, SqlJsStatic };
  export default function initSqlJs(config?: InitConfig): Promise<SqlJsStatic>;
}
