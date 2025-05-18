import { Sequelize } from 'sequelize-typescript';
import { config } from './config';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  models: [__dirname + '/../models'],
  logging: config.nodeEnv === 'development' ? console.log : false,
});

export default sequelize; 