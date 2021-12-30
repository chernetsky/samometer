const testVariables = {
  NODE_ENV: 'test',
  IS_LOCAL: 'true',
  DB_HOST: 'localhost',
  DB_NAME: 'test_samometer',
  DB_PASSWORD: 'test_password',
  DB_USER: 'test_samometer',
};

Object.assign(process.env, testVariables);
