var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var _a = require("./connection"), init = _a.init, withConnection = _a.withConnection;
var Queries = require("./queries");
var formatColumn = function (_a) {
    var column = _a.column, indexes = _a.indexes, foreignKeys = _a.foreignKeys, checkConstraints = _a.checkConstraints;
    return ({
        name: column.column_name,
        nullable: column.is_nulable === "YES",
        defaultValue: column.column_default,
        type: column.data_type,
        unique: (indexes || []).some(function (idx) {
            return idx.is_unique &&
                !idx.is_primary &&
                idx.indexed_columns.some(function (x) { return x === column.column_name; });
        }),
        primary: (indexes || []).some(function (idx) {
            return idx.is_primary &&
                idx.indexed_columns.some(function (x) { return x === column.column_name; });
        }),
        foreign: (foreignKeys || []).find(function (key) { return key.column_name === column.column_name; }),
        check: (checkConstraints || []).filter(function (constraint) {
            return constraint.column_name === column.column_name &&
                column.table_name === constraint.table_name;
        }),
    });
};
var loadDatabase = function (connectionOptions) { return __awaiter(_this, void 0, void 0, function () {
    var database, _a, isError, result;
    var _this = this;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                database = [];
                init(connectionOptions);
                return [4 /*yield*/, withConnection(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        var schemas, _loop_1, _i, schemas_1, schema;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, client.query(Queries.listSchemas(true))];
                                case 1:
                                    schemas = (_a.sent()).rows;
                                    _loop_1 = function (schema) {
                                        var tables, schemaConfig, functions, checkConstraints, _loop_2, i;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0: return [4 /*yield*/, client.query(Queries.listTablesBySchema(schema))];
                                                case 1:
                                                    tables = (_b.sent()).rows;
                                                    schemaConfig = {
                                                        schema: schema,
                                                        checkConstraints: [],
                                                        functions: [],
                                                        tables: tables.map(function (_a) {
                                                            var table = _a.table;
                                                            return ({
                                                                table: table,
                                                                columns: [],
                                                                indexes: [],
                                                                foreignKeys: [],
                                                                triggers: [],
                                                            });
                                                        }),
                                                    };
                                                    return [4 /*yield*/, client.query(Queries.listSchemaFunctions(schema))];
                                                case 2:
                                                    functions = (_b.sent()).rows;
                                                    return [4 /*yield*/, client.query(Queries.listSchemaCheckConstraints(schema))];
                                                case 3:
                                                    checkConstraints = (_b.sent()).rows;
                                                    schemaConfig.checkConstraints = checkConstraints;
                                                    schemaConfig.functions = functions;
                                                    _loop_2 = function (i) {
                                                        var columns, indexes, foreignKeys, triggers;
                                                        return __generator(this, function (_c) {
                                                            switch (_c.label) {
                                                                case 0: return [4 /*yield*/, client.query(Queries.listColumnsByTableAndSchema(schema, schemaConfig.tables[i].table))];
                                                                case 1:
                                                                    columns = (_c.sent()).rows;
                                                                    return [4 /*yield*/, client.query(Queries.listIndexesByTableAndSchema(schema, schemaConfig.tables[i].table))];
                                                                case 2:
                                                                    indexes = (_c.sent()).rows;
                                                                    return [4 /*yield*/, client.query(Queries.listForeignKeysByTableAndSchema(schema, schemaConfig.tables[i].table))];
                                                                case 3:
                                                                    foreignKeys = (_c.sent()).rows;
                                                                    return [4 /*yield*/, client.query(Queries.listTriggersByTableAndSchema(schema, schemaConfig.tables[i].table))];
                                                                case 4:
                                                                    triggers = (_c.sent()).rows;
                                                                    schemaConfig.tables[i].indexes = indexes;
                                                                    schemaConfig.tables[i].foreignKeys = foreignKeys;
                                                                    schemaConfig.tables[i].columns = columns.map(function (column) {
                                                                        return formatColumn({
                                                                            column: column,
                                                                            indexes: indexes,
                                                                            foreignKeys: foreignKeys,
                                                                            checkConstraints: checkConstraints,
                                                                        });
                                                                    });
                                                                    schemaConfig.tables[i].triggers = triggers;
                                                                    return [2 /*return*/];
                                                            }
                                                        });
                                                    };
                                                    i = 0;
                                                    _b.label = 4;
                                                case 4:
                                                    if (!(i < schemaConfig.tables.length)) return [3 /*break*/, 7];
                                                    return [5 /*yield**/, _loop_2(i)];
                                                case 5:
                                                    _b.sent();
                                                    _b.label = 6;
                                                case 6:
                                                    i++;
                                                    return [3 /*break*/, 4];
                                                case 7:
                                                    database.push(schemaConfig);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _i = 0, schemas_1 = schemas;
                                    _a.label = 2;
                                case 2:
                                    if (!(_i < schemas_1.length)) return [3 /*break*/, 5];
                                    schema = schemas_1[_i].schema;
                                    return [5 /*yield**/, _loop_1(schema)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 5: return [2 /*return*/, database];
                            }
                        });
                    }); })];
            case 1:
                _a = _b.sent(), isError = _a.isError, result = _a.result;
                if (isError) {
                    throw result;
                }
                return [2 /*return*/, result];
        }
    });
}); };
module.exports = loadDatabase;
