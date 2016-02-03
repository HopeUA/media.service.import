import MySQL from 'mysql';
import Config from 'config';
import Logger from './logger';

Logger.info('MySQL create connection');
const connection = MySQL.createConnection(
    Config.get('mysql')
);

export default class DB {
    static query(query) {
        Logger.info('MySQL query', { query });

        return new Promise((resolve, reject) => {
            connection.query(query, (error, rows) => {
                if (error) {
                    Logger.error('MySQL query error', { error });
                    return reject(error);
                }

                Logger.info('MySQL query success');
                resolve(rows);
            });
        });
    }

    static async queryOne(query) {
        const result = await this.query(query);
        if (result.length > 0) {
            return result[0];
        }

        return null;
    }
}
