//permissions
const tablePermissions=document.querySelector("[table-permissions]");
if(tablePermissions){
    const buttonPermissions=document.querySelector("[button-submit]");
    buttonPermissions.addEventListener("click",()=>{
        let Permission=[];
        const rows=tablePermissions.querySelectorAll("[data-name]");
        rows.forEach(row=>{
            const name=row.getAttribute("data-name");
            const inputs=row.querySelectorAll("input");
            
            if(name=="id"){
                inputs.forEach(input => {
                    const id=input.value;
                    Permission.push({
                        id:id,
                        Permission:[]
                    })
                })
            }
            else{
                inputs.forEach((input,index)=>{
                    const checked=input.checked;
                    // console.log(name);
                    // console.log(index);
                    // console.log(checked);
                    // console.log("----------------------")
                    if(checked){
                        Permission[index].Permission.push(name);
                    }
                })
            }

        })
        if(Permission.length > 0){
            const formChangePermission=document.querySelector("#form-change-permissions");
           console.log(formChangePermission);

            const input=formChangePermission.querySelector(`input[name="permissions"]`);
           console.log(input);

            input.value=JSON.stringify(Permission);
           console.log(input.value);
           formChangePermission.submit();
        }
        // console.log(Permission);
    })
}


//end  permissions

// permission default button
const dataRecords=document.querySelector("[data-records]");
if(dataRecords){
    const records=JSON.parse(dataRecords.getAttribute("data-records"));
    console.log(records);
    const tablePermission=document.querySelector("[table-permissions]");
    records.forEach((record,index) =>{
        const permissions=record.permission;
        console.log(permissions);
        permissions.forEach((permission)=>{
            const row = tablePermission.querySelector(`[data-name="${permission}"]`);
            const input=row.querySelectorAll("input")[index];
            input.checked=true;
            console.log(permission);
            console.log(index);
            console.log("-----------------");
        });

    })

}
// end permission default button
