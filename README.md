# Easy PG Scanner

Easy PG Scanner is a Node.js package designed specifically for personal usage to simplify the process of reading PostgreSQL database schemas, including tables, functions, columns, triggers, indexes, and check constraints. It provides a convenient interface to fetch this information and organize it into a structured array.

## Installation

To install Easy PG Scanner, you can use npm:

```bash
npm install easy-pg-scanner
```

## Usage

Here's a simple example demonstrating how to use Easy PG Scanner:

```javascript
const loadDatabase = require("easy-pg-scanner");

// Your PostgreSQL connection options
const connectionOptions = {
  host: "...",
  port: 5432,
  user: "...",
  password: "...",
  database: "postgres",
};

const fetchDatabase = async () => {
  try {
    const database = await loadDatabase(connectionOptions);
    console.log(database);
  } catch (error) {
    console.error("Error loading database:", error);
  }
};

fetchDatabase();
```

## Output Format

The package exports a function `loadDatabase` which, when invoked with the appropriate connection options, asynchronously fetches the database schema and returns an array representing the schema information. The array contains objects representing each schema in the database. Each schema object includes the following properties:

- `schema`: The name of the schema.
- `checkConstraints`: An array of check constraints defined in the schema.
- `functions`: An array of functions defined in the schema.
- `tables`: An array of objects representing each table in the schema. Each table object contains:
  - `table`: The name of the table.
  - `columns`: An array of column objects representing the columns in the table. Each column object includes properties such as `name`, `nullable`, `defaultValue`, `type`, `unique`, `primary`, `foreign`, and `check`.
  - `indexes`: An array of indexes defined on the table.
  - `foreignKeys`: An array of foreign keys defined on the table.
  - `triggers`: An array of triggers defined on the table.
