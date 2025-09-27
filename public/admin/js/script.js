//button
const buttonStatus=document.querySelectorAll("[button-status]")
if(buttonStatus.length > 0){
    const url=new URL(window.location.href);

    buttonStatus.forEach(buttons =>{
         buttons.addEventListener("click",()=>{
            const status=buttons.getAttribute("button-status")
            if(status){
                url.searchParams.set("status",status); //"status la cua params tren thanh timkiem hientai", status la cua bien moi dinh nghia
                
            }
            else{
                url.searchParams.delete("status");
            }
        //    console.log(url.href)
         window.location.href=url.href;

         })
    })
}
//button end

//tim kiem
const formSearch=document.querySelector("#form-search")
if(formSearch){
    let url=new URL(window.location.href);
    formSearch.addEventListener("submit", (e)=>{
       e.preventDefault();
       const keyword=e.target.elements.keyword.value;
    //    console.log(e.target.elements.keyword.value);
   if(keyword){
    url.searchParams.set("keyword",keyword)
   }
   else{
    url.searchParams.delete("keyword");
   }
   window.location.href=url.href;


})
}

//end tim kiem

//pagination
const buttonPagination=document.querySelectorAll("[button-pagination]");

if(buttonPagination){
    let url=new URL(window.location.href);

buttonPagination.forEach((button)=>{
      button.addEventListener("click",()=>{
           const page=button.getAttribute("button-pagination");
           url.searchParams.set("page",page);

           window.location.href=url.href;
      })
})
}

//end pagination
//show alert
const showAlert=document.querySelector("[show-alert]");
if(showAlert){
    const time=parseInt(showAlert.getAttribute("data-time"));
    const close=showAlert.querySelector("[close-alert]");
setTimeout(()=>{
     showAlert.classList.add("alert-hidden");
},time);

    close.addEventListener("click",()=>{
      
     showAlert.classList.add("alert-hidden");

    })
}


//end show alert

//image-preview-uploads
const uploadImage=document.querySelector("[upload-image]");
if(uploadImage){
const uploadImageInput=document.querySelector("[upload-image-input]");
const uploadImagePreview=document.querySelector("[upload-image-preview]");
 const closeImage=document.querySelector(".close-image");

   uploadImageInput.addEventListener("change",(e)=>{
         const [file]=e.target.files;
        if(file){
             uploadImagePreview.src=URL.createObjectURL(file);
             closeImage.style.display="block";
        }
}) 
closeImage.addEventListener("click",()=>{
    uploadImagePreview.src="";
    uploadImageInput.value="";
    closeImage.style.display="none";
})
}
//end image-preview-uploads

//sort
const sort=document.querySelector("[sort]");
if(sort){
    let url=new URL(window.location.href);
    const sortSelect=sort.querySelector("[sort-select]");
    const sortClear=sort.querySelector("[sort-clear]");
    sortSelect.addEventListener("change",(e)=>{
        let value=e.target.value;
        const [sortKey,sortValue]=value.split("-");
        // console.log(sortKey);
        // console.log(sortValue);

        url.searchParams.set("sortKey",sortKey);
        url.searchParams.set("sortValue",sortValue);
        window.location.href=url.href;
    })
//Xoa di cac key va value
    sortClear.addEventListener("click",()=>{
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");
    window.location.href=url.href;
})
//Thiet lap mac dinh cho cai user da chon
const sortKey=url.searchParams.get("sortKey");
const sortValue=url.searchParams.get("sortValue");
if(sortKey && sortValue){
    const stringSort=`${sortKey}-${sortValue}`;
    const sortSelected=sortSelect.querySelector(`option[value=${sortString}]`);
    sortSelected.selected=true;
    
}
}
//end sort

