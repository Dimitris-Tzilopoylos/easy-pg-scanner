export = loadDatabase;
declare function loadDatabase(connectionOptions: {
  user?: string;
  port?: number | string;
  password?: string;
  host?: string;
  database?: string;
}): Promise<any>;
