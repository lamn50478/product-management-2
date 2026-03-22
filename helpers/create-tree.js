// count=0;
// const createTree=(arr , parentId="",count={value:0})=>{
//       const tree=[];
//       arr.forEach((item) => {
//         if(item.parent_id===parentId){
//          var newItem=item;
//          newItem.index=count.value++;
//          const children=createTree(arr,item.id,count); 
        
//          if(children.length > 0){
//             newItem.children=children;
           
//          }
    
//          tree.push(newItem);
         
//         }
//       });
//       console.log(tree)
//       return tree;
  
// }
// module.exports.tree=(arr , parentId="")=>{
   
//      const resultTree=createTree(arr , parentId="",{value:0});
//      return resultTree;
// }
// helpers/create-tree.js
function normalizeId(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v.toString === 'function') return v.toString();
  return String(v);
}

function createTree(arr, parentId = '', count = { value: 0 }, seen = new Set()) {
  const tree = [];
  const parentKey = normalizeId(parentId);

  for (const item of arr) {
    const itemParent = normalizeId(item.parent_id);
    if (itemParent === parentKey) {
      const itemId = normalizeId(item._id ?? item.id);
      // guard: tránh self-parenting hoặc vòng lặp
      if (!itemId || itemId === parentKey || seen.has(itemId)) {
        continue;
      }

      // shallow clone để không mutate object gốc
      const newItem = { ...item };
      newItem.index = count.value++;

      // đánh dấu đã thấy trong nhánh này
      seen.add(itemId);

      const children = createTree(arr, itemId, count, seen);
      if (children.length > 0) newItem.children = children;

      // bỏ đánh dấu để xử lý các nhánh khác đúng
      seen.delete(itemId);

      tree.push(newItem);
    }
  }

  return tree;
}

module.exports.tree = (arr, parentId = '') => {
  return createTree(arr, parentId, { value: 0 });
};
