export function listSchemas(ignoreDefaults?: boolean): string;
export function listTablesBySchema(schemaname: any): string;
export function listColumnsByTableAndSchema(schemaname: any, table: any): string;
export function listForeignKeysByTableAndSchema(schemaname: any, table: any): string;
export function listIndexesByTableAndSchema(schemaname: any, table: any): string;
export function listTriggersByTableAndSchema(schemaname: any, table: any): string;
export function listSchemaFunctions(schemaname: any): string;
export function listSchemaCheckConstraints(schemaname: any): string;
