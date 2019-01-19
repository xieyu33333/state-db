import {DB} from './common/db.js';
import devtool from './common/devtool.db.js';

console.log(DB,'******************************')
const db = new DB();
devtool(db, 'html');

export default db;