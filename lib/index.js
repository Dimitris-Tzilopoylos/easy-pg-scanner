const { init, withConnection } = require("./connection");
const Queries = require("./queries");

const formatColumn = ({ column, indexes, foreignKeys, checkConstraints }) => ({
  isArray: column.data_type === "ARRAY",
  name: column.column_name,
  nullable: column.is_nullable === "YES",
  defaultValue: column.column_default,
  type:
    column.data_type === "ARRAY"
      ? `${column.udt_name.substring(1)}[]`
      : column.data_type,
  unique: (indexes || []).some(
    (idx) =>
      idx.is_unique &&
      !idx.is_primary &&
      idx.indexed_columns.some((x) => x === column.column_name)
  ),
  primary: (indexes || []).some(
    (idx) =>
      idx.is_primary &&
      idx.indexed_columns.some((x) => x === column.column_name)
  ),
  foreign: (foreignKeys || []).find(
    (key) => key.column_name === column.column_name
  ),
  check: (checkConstraints || []).filter(
    (constraint) =>
      constraint.column_name === column.column_name &&
      column.table_name === constraint.table_name
  ),
});

const loadDatabase = async (connectionOptions) => {
  const database = [];
  init(connectionOptions);
  const { isError, result } = await withConnection(async (client) => {
    const { rows: schemas } = await client.query(Queries.listSchemas(true));

    for (const { schema } of schemas) {
      const { rows: tables } = await client.query(
        Queries.listTablesBySchema(schema)
      );
      const schemaConfig = {
        schema,
        checkConstraints: [],
        functions: [],
        tables: tables.map(({ table }) => ({
          table,
          columns: [],
          indexes: [],
          foreignKeys: [],
          triggers: [],
        })),
      };

      const { rows: functions } = await client.query(
        Queries.listSchemaFunctions(schema)
      );

      const { rows: checkConstraints } = await client.query(
        Queries.listSchemaCheckConstraints(schema)
      );

      schemaConfig.checkConstraints = checkConstraints;

      schemaConfig.functions = functions;

      for (let i = 0; i < schemaConfig.tables.length; i++) {
        const { rows: columns } = await client.query(
          Queries.listColumnsByTableAndSchema(
            schema,
            schemaConfig.tables[i].table
          )
        );

        const { rows: indexes } = await client.query(
          Queries.listIndexesByTableAndSchema(
            schema,
            schemaConfig.tables[i].table
          )
        );
        const { rows: foreignKeys } = await client.query(
          Queries.listForeignKeysByTableAndSchema(
            schema,
            schemaConfig.tables[i].table
          )
        );

        const { rows: triggers } = await client.query(
          Queries.listTriggersByTableAndSchema(
            schema,
            schemaConfig.tables[i].table
          )
        );

        schemaConfig.tables[i].indexes = indexes;
        schemaConfig.tables[i].foreignKeys = foreignKeys;
        schemaConfig.tables[i].columns = columns.map((column) =>
          formatColumn({
            column,
            indexes,
            foreignKeys,
            checkConstraints,
          })
        );
        schemaConfig.tables[i].triggers = triggers;
      }
      database.push(schemaConfig);
    }

    return database;
  });

  if (isError) {
    throw result;
  }

  return result;
};

module.exports = loadDatabase;
