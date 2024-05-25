const Queries = {
  listSchemas: (ignoreDefaults = true) =>
    `select schema_name as schema from information_schema.schemata ${
      ignoreDefaults
        ? `where schema_name not in ('information_schema','pg_catalog','pg_toast')`
        : ""
    };`,

  listTablesBySchema: (schemaname) =>
    `select tablename as table from pg_tables where schemaname = '${schemaname}';`,

  listColumnsByTableAndSchema: (schemaname, table) =>
    `select * from information_schema.columns where table_name = '${table}' AND table_schema  = '${schemaname}';`,
  listForeignKeysByTableAndSchema: (schemaname, table) => `SELECT
    conname AS fk_name,
    pg_get_constraintdef(pg_constraint.oid) AS fk_definition,
    col.column_schema AS column_schema,
    col.column_table AS column_table,
    col.column_name AS column_name,
    ref_schema.nspname AS referenced_schema,
    ref_table.relname AS referenced_table,
    ref_col.column_name AS referenced_column,
    CASE pg_constraint.confupdtype
        WHEN 'c' THEN 'CASCADE'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'a' THEN 'NO ACTION'
        ELSE 'UNKNOWN'
    END AS on_update,
    CASE pg_constraint.confdeltype
        WHEN 'c' THEN 'CASCADE'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        WHEN 'a' THEN 'NO ACTION'
        ELSE 'UNKNOWN'
    END AS on_delete
FROM
    pg_constraint
    JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    JOIN LATERAL (
        SELECT
            attname AS column_name,
            nspname AS column_schema,
            relname AS column_table
        FROM
            pg_attribute
            JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
        WHERE
            attrelid = pg_constraint.conrelid
            AND attnum = ANY(pg_constraint.conkey)
    ) AS col ON true
    JOIN pg_class AS ref_table ON pg_constraint.confrelid = ref_table.oid
    JOIN pg_namespace AS ref_schema ON ref_table.relnamespace = ref_schema.oid
    JOIN LATERAL (
        SELECT
            attname AS column_name
        FROM
            pg_attribute
            JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
        WHERE
            attrelid = pg_constraint.confrelid
            AND attnum = ANY(pg_constraint.confkey)
    ) AS ref_col ON true
WHERE
    pg_constraint.contype = 'f' 
    AND pg_namespace.nspname = '${schemaname}' 
    AND pg_class.relname = '${table}';
`,
  listIndexesByTableAndSchema: (schemaname, table) => `SELECT
    index_name,
    index_definition,
    index_type,
    is_unique,
    is_primary,
    json_agg(column_name ORDER BY column_position) AS indexed_columns
FROM (
    SELECT
        index_name,
        index_definition,
        index_type,
        is_unique,
        is_primary,
        column_name,
        column_position
    FROM (
        SELECT
            indexrelid::regclass AS index_name,
            pg_get_indexdef(indexrelid) AS index_definition,
            CASE
                WHEN indisprimary THEN 'PRIMARY'
                WHEN indisunique THEN 'UNIQUE'
                ELSE
                    CASE
                        WHEN indexdef ~* 'USING btree' THEN 'BTREE Index'
                        WHEN indexdef ~* 'USING gin' THEN 'GIN Index'
                        WHEN indexdef ~* 'USING hash' THEN 'HASH Index'
                        WHEN indexdef ~* 'USING gist' THEN 'GiST Index'
                        ELSE 'Non-Unique Index'
                    END
            END AS index_type,
            indisunique AS is_unique,
            indisprimary AS is_primary,
            att.attname AS column_name,
            cols.ordinality AS column_position
        FROM
            pg_index idx
            JOIN LATERAL unnest(idx.indkey) WITH ORDINALITY AS cols(attid, ordinality) ON true
            JOIN pg_attribute att ON att.attrelid = idx.indrelid AND att.attnum = cols.attid
            LEFT JOIN pg_class cls ON cls.oid = idx.indexrelid
            LEFT JOIN pg_indexes idxs ON idxs.indexname = cls.relname
        WHERE
            idx.indrelid = '${schemaname}.${table}'::regclass
    ) AS index_info
) AS result
GROUP BY
    index_name,
    index_definition,
    index_type,
    is_unique,
    is_primary
ORDER BY
    index_name;
 `,

  listTriggersByTableAndSchema: (schemaname, table) => `SELECT
    trg.tgname AS trigger_name,
    pg_get_triggerdef(trg.oid) AS trigger_definition
FROM
    pg_trigger trg
JOIN pg_class tbl ON trg.tgrelid = tbl.oid
JOIN pg_namespace nsp ON tbl.relnamespace = nsp.oid
WHERE
    nsp.nspname = '${schemaname}'
    AND tbl.relname = '${table}';
`,
  listSchemaFunctions: (schemaname) => `SELECT
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM
    pg_proc
WHERE
    pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaname}') and prokind != 'a';
`,
  listSchemaCheckConstraints: (schemaname) => `SELECT
    c.conname AS constraint_name,
    n.nspname AS schema_name,
    t.relname AS table_name,
    a.attname AS column_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM
    pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
WHERE
    c.contype = 'c' 
    AND n.nspname = '${schemaname}';  
`,
};

module.exports = Queries;
