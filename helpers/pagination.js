module.exports=(objectPagination,countProducts,query)=>{
     if(query.page){
       objectPagination.currentPage=parseInt(query.page);
        objectPagination.skip=(objectPagination.currentPage - 1) * objectPagination.limitPages;
     
   };

    
    const totalPage=Math.ceil((countProducts)/(objectPagination.limitPages));
    objectPagination.totalPage=totalPage;

   return objectPagination;
}