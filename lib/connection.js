const { Client } = require("pg");

const config = {};

const init = (conf) => {
  if (conf) {
    Object.assign(config, conf);
  }
};

const createConnection = (conf = config) => {
  const client = new Client(conf);

  return client;
};

const withConnection = async (cb) => {
  const client = createConnection();
  try {
    await client.connect();
    const result = await cb(client);
    return { isError: false, result };
  } catch (error) {
    return { isError: true, result: error };
  } finally {
    await client.end();
  }
};

module.exports = {
  createConnection,
  init,
  config,
  withConnection,
};
