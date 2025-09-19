module.exports=(query)=>{
       let filterStatus=[
 {    class:"",
      name:"Tat ca",
      status:""
 },
  {   
      class:"",
      name:"Hoat dong",
      status:"active"
 },
{   
      class:"",
      name:"Dung hoat dong",
      status:"inactive"
 }
  

]
if(query.status){
     const index=filterStatus.findIndex(item=> item.status==query.status);//item.status==req.query.status : loc ra tung phan tu cua mang filter va doi chieu voi params do nguoi dung nhap vao
     filterStatus[index].class="active";
  }
  else{
   filterStatus[0].class="active"
  }
  return filterStatus;
}