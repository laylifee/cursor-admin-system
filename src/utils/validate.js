// 检查路径是否为外部链接
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

// 验证用户名（至少3个字符）
export function validUsername(str) {
  return str.trim().length >= 3
}

// 验证密码（至少6个字符）
export function validPassword(str) {
  return str.length >= 6
}

// 验证URL格式
export function validURL(url) {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

// 验证电子邮件格式
export function validEmail(email) {
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return reg.test(email)
}

// 定义一个函数，用于将数组转换为树形结构
function arrayToTree(arr) {
    // 定义一个递归函数，用于处理数组中的每个元素
    function recursiveBuildTree(parent, children) {
        // 遍历子节点数组
        for (let i = 0; i < children.length; i++) {
            // 获取当前子节点
            const child = children[i];
            // 创建一个新的子树节点
            const newNode = {
                id: child.id,
                parentId: parent.id,
                children: []
            };
            // 将新节点添加到父节点的子节点列表中
            parent.children.push(newNode);
            // 如果当前子节点还有子节点，则递归调用构建子树
            if (child.children && child.children.length > 0) {
                recursiveBuildTree(newNode, child.children);
            }
        }
    }

    // 创建一个根节点对象
    const root = {
        id: 'root',
        parentId: null,
        children: []
    };

    // 调用递归函数，构建树形结构
    recursiveBuildTree(root, arr);

    // 返回根节点的子节点数组，即树形结构的数组
    return root.children;
}

// // 使用示例
// const flatArray = [
//     { id: 1, parentId: null },
//     { id: 2, parentId: 1 },
//     { id: 3, parentId: 1 },
//     { id: 4, parentId: 2 },
//     { id: 5, parentId: 2 },
//     { id: 6, parentId: 3 }
// ];

// const treeArray = arrayToTree(flatArray);
// console.log(treeArray);