var Queries = {
  listSchemas: function (ignoreDefaults) {
    if (ignoreDefaults === void 0) {
      ignoreDefaults = true;
    }
    return "select schema_name as schema from information_schema.schemata ".concat(
      ignoreDefaults
        ? "where schema_name not in ('information_schema','pg_catalog','pg_toast')"
        : "",
      ";"
    );
  },
  listTablesBySchema: function (schemaname) {
    return "select tablename as table from pg_tables where schemaname = '".concat(
      schemaname,
      "';"
    );
  },
  listColumnsByTableAndSchema: function (schemaname, table) {
    return "select * from information_schema.columns where table_name = '"
      .concat(table, "' AND table_schema  = '")
      .concat(schemaname, "';");
  },
  listForeignKeysByTableAndSchema: function (schemaname, table) {
    return "SELECT\n    conname AS fk_name,\n    pg_get_constraintdef(pg_constraint.oid) AS fk_definition,\n    col.column_schema AS column_schema,\n    col.column_table AS column_table,\n    col.column_name AS column_name,\n    ref_schema.nspname AS referenced_schema,\n    ref_table.relname AS referenced_table,\n    ref_col.column_name AS referenced_column,\n    CASE pg_constraint.confupdtype\n        WHEN 'c' THEN 'CASCADE'\n        WHEN 'r' THEN 'RESTRICT'\n        WHEN 'n' THEN 'SET NULL'\n        WHEN 'd' THEN 'SET DEFAULT'\n        WHEN 'a' THEN 'NO ACTION'\n        ELSE 'UNKNOWN'\n    END AS on_update,\n    CASE pg_constraint.confdeltype\n        WHEN 'c' THEN 'CASCADE'\n        WHEN 'r' THEN 'RESTRICT'\n        WHEN 'n' THEN 'SET NULL'\n        WHEN 'd' THEN 'SET DEFAULT'\n        WHEN 'a' THEN 'NO ACTION'\n        ELSE 'UNKNOWN'\n    END AS on_delete\nFROM\n    pg_constraint\n    JOIN pg_class ON pg_constraint.conrelid = pg_class.oid\n    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace\n    JOIN LATERAL (\n        SELECT\n            attname AS column_name,\n            nspname AS column_schema,\n            relname AS column_table\n        FROM\n            pg_attribute\n            JOIN pg_class ON pg_class.oid = pg_attribute.attrelid\n        WHERE\n            attrelid = pg_constraint.conrelid\n            AND attnum = ANY(pg_constraint.conkey)\n    ) AS col ON true\n    JOIN pg_class AS ref_table ON pg_constraint.confrelid = ref_table.oid\n    JOIN pg_namespace AS ref_schema ON ref_table.relnamespace = ref_schema.oid\n    JOIN LATERAL (\n        SELECT\n            attname AS column_name\n        FROM\n            pg_attribute\n            JOIN pg_class ON pg_class.oid = pg_attribute.attrelid\n        WHERE\n            attrelid = pg_constraint.confrelid\n            AND attnum = ANY(pg_constraint.confkey)\n    ) AS ref_col ON true\nWHERE\n    pg_constraint.contype = 'f' \n    AND pg_namespace.nspname = '"
      .concat(schemaname, "' \n    AND pg_class.relname = '")
      .concat(table, "';\n");
  },
  listIndexesByTableAndSchema: function (schemaname, table) {
    return "SELECT\n    index_name,\n    index_definition,\n    index_type,\n    is_unique,\n    is_primary,\n    json_agg(column_name ORDER BY column_position) AS indexed_columns\nFROM (\n    SELECT\n        index_name,\n        index_definition,\n        index_type,\n        is_unique,\n        is_primary,\n        column_name,\n        column_position\n    FROM (\n        SELECT\n            indexrelid::regclass AS index_name,\n            pg_get_indexdef(indexrelid) AS index_definition,\n            CASE\n                WHEN indisprimary THEN 'PRIMARY'\n                WHEN indisunique THEN 'UNIQUE'\n                ELSE\n                    CASE\n                        WHEN indexdef ~* 'USING btree' THEN 'BTREE Index'\n                        WHEN indexdef ~* 'USING gin' THEN 'GIN Index'\n                        WHEN indexdef ~* 'USING hash' THEN 'HASH Index'\n                        WHEN indexdef ~* 'USING gist' THEN 'GiST Index'\n                        ELSE 'Non-Unique Index'\n                    END\n            END AS index_type,\n            indisunique AS is_unique,\n            indisprimary AS is_primary,\n            att.attname AS column_name,\n            cols.ordinality AS column_position\n        FROM\n            pg_index idx\n            JOIN LATERAL unnest(idx.indkey) WITH ORDINALITY AS cols(attid, ordinality) ON true\n            JOIN pg_attribute att ON att.attrelid = idx.indrelid AND att.attnum = cols.attid\n            LEFT JOIN pg_class cls ON cls.oid = idx.indexrelid\n            LEFT JOIN pg_indexes idxs ON idxs.indexname = cls.relname\n        WHERE\n            idx.indrelid = '"
      .concat(schemaname, ".")
      .concat(
        table,
        "'::regclass\n    ) AS index_info\n) AS result\nGROUP BY\n    index_name,\n    index_definition,\n    index_type,\n    is_unique,\n    is_primary\nORDER BY\n    index_name;\n "
      );
  },
  listTriggersByTableAndSchema: function (schemaname, table) {
    return "SELECT\n    trg.tgname AS trigger_name,\n    pg_get_triggerdef(trg.oid) AS trigger_definition\nFROM\n    pg_trigger trg\nJOIN pg_class tbl ON trg.tgrelid = tbl.oid\nJOIN pg_namespace nsp ON tbl.relnamespace = nsp.oid\nWHERE\n    nsp.nspname = '"
      .concat(schemaname, "'\n    AND tbl.relname = '")
      .concat(table, "';\n");
  },
  listSchemaFunctions: function (schemaname) {
    return "SELECT\n    proname AS function_name,\n    pg_get_functiondef(oid) AS function_definition\nFROM\n    pg_proc\nWHERE\n    pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = '".concat(
      schemaname,
      "') and prokind != 'a';\n"
    );
  },
  listSchemaCheckConstraints: function (schemaname) {
    return "SELECT\n    c.conname AS constraint_name,\n    n.nspname AS schema_name,\n    t.relname AS table_name,\n    a.attname AS column_name,\n    pg_get_constraintdef(c.oid) AS constraint_definition\nFROM\n    pg_constraint c\nJOIN pg_class t ON c.conrelid = t.oid\nJOIN pg_namespace n ON t.relnamespace = n.oid\nJOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)\nWHERE\n    c.contype = 'c' \n    AND n.nspname = '".concat(
      schemaname,
      "';  \n"
    );
  },
};
module.exports = Queries;
