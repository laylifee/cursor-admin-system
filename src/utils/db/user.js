import { openDB } from 'idb'; // 导入 indexedDB 的 openDB 方法

import { dbName, tableNames } from '../dbConfig'; // 导入数据库名称和存储名称
// 创建一个 Promise，用于打开数据库
const dbPromise = openDB(dbName, 1, {
    upgrade(db) { // 如果数据库版本更新，执行以下操作
        // 创建用户表
        if (!db.objectStoreNames.contains(tableNames.user)) {
            db.createObjectStore(tableNames.user, { keyPath: 'id', autoIncrement: true });
        }
        // // 创建权限表
        // if (!db.objectStoreNames.contains(tableNames.permission)) {
        //     db.createObjectStore(tableNames.permission, { keyPath: 'id', autoIncrement: true });
        // }  
        // // 创建角色表
        // if (!db.objectStoreNames.contains(tableNames.role)) {
        //     db.createObjectStore(tableNames.role, { keyPath: 'id', autoIncrement: true });
        // }
        // // 创建角色权限表
        // if (!db.objectStoreNames.contains(tableNames.rolePermission)) {
        //     db.createObjectStore(tableNames.rolePermission, { keyPath: 'id', autoIncrement: true });
        //     // 为角色创建一个索引，用于关联到权限
        //     const roleStore = db.createObjectStore(tableNames.rolePermission, { keyPath: 'id' });
        //     roleStore.createIndex('permissionId', 'permissionId', { unique: false });
        
        // }
        // // 创建用户角色表
        // if (!db.objectStoreNames.contains(tableNames.userRole)) {
        //     db.createObjectStore(tableNames.userRole, { keyPath: 'id', autoIncrement: true });
        //     // 为用户创建一个索引，用于关联到角色
        //     const userStore = db.createObjectStore(tableNames.userRole, { keyPath: 'id' });
        //     userStore.createIndex('roleId', 'roleId', { unique: false });
        // }
        // // 创建菜单表
        // if (!db.objectStoreNames.contains(tableNames.menu)) {
        //     db.createObjectStore(tableNames.menu, { keyPath: 'id', autoIncrement: true });
        // }
    },
    blocking() {
        // 数据库打开时的回调函数
        console.log('Database opened');
    },
    blocking() {
        // 数据库打开失败时的回调函数
        console.error('Database opening failed');
    },
    terminated () {
        // 数据库关闭时的回调函数
        console.log('Database closed');
    },

})
// 获取所有用户数据
export async function getAllUsers() {
    const db = await dbPromise;
    // Bug 修复：检查 object store 是否存在
    if (!db.objectStoreNames.contains(tableNames.user)) {
        throw new Error('Object store not found');
    }
    const tx = db.transaction(tableNames.user,'readonly');
    const store = tx.objectStore(tableNames.user);
    return await store.getAll();
}
// 新增用户数据
export async function addUser(user) {
  const db = await dbPromise;
  const tx = db.transaction(tableNames.user,'readwrite');
  const store = tx.objectStore(tableNames.user);
  await store.add(user);
  await tx.complete;
}
// 删除用户数据
export async function deleteUser(id) {
  const db = await dbPromise;
  const tx = db.transaction(tableNames.user,'readwrite');
  const store = tx.objectStore(tableNames.user);
  await store.delete(id);
  await tx.complete;
}
// 更新用户数据
export async function updateUser(id, updatedUser) {
  const db = await dbPromise;
  const tx = db.transaction(tableNames.user,'readwrite');
  const store = tx.objectStore(tableNames.user);
  await store.put(updatedUser, id);
  await tx.complete;
}

//批量新增用户
export async function addUserBatch(userList) {
    const db = await dbPromise;
    // Bug 修复：检查 object store 是否存在
    if (!db.objectStoreNames.contains(tableNames.user)) {
        throw new Error('Object store not found');
    }
    const tx = db.transaction(tableNames.user,'readwrite');
    const store = tx.objectStore(tableNames.user);
    for (const user of userList) {
        await store.add(user);
    }
    await tx.complete;
}