import DB from './common/db.js';
import devtool from './common/devtool.db.js';

const db = new DB();
devtool(db, 'html');

export default db;