// db.js
import { openDB } from 'idb'; // 导入 indexedDB 的 openDB 方法

const dbName = 'myDatabase'; // 定义数据库名称

// 定义数据库的表名
const tableNames = {
    user: 'users',
    permission: 'permission',
    role: 'role',
    rolePermission: 'rolePermission',
    userRole: 'userRole',
    menu:'menu',
};

export {
    dbName,
    tableNames,
}