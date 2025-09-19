//button-change-status
document.addEventListener("DOMContentLoaded", () => {
  const formChangeStatus = document.querySelector("#form-change-status");

  const buttonChangeStatus = document.querySelectorAll(
    "[button-change-status]"
  );
  if (buttonChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");
    console.log(path);

    buttonChangeStatus.forEach((button) => {
      button.addEventListener("click", () => {
        const statusCurrent = button.getAttribute("data-status");
        const id = button.getAttribute("data-id");
        console.log(id);
        const statusChange = statusCurrent === "active" ? "inactive" : "active";

        // console.log(statusCurrent);
        // console.log(id);
        // console.log(statusChange);
        const action = path + `/${statusChange}/${id}?_method=PATCH`;
        formChangeStatus.action = action;
        formChangeStatus.submit();
      });
    });
  }
});
//button-changestatus

//checkbox-change-multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputIds = checkboxMulti.querySelectorAll("input[name='id']");

  inputCheckAll.addEventListener("click", () => {
    if (inputCheckAll.checked == true) {
      inputIds.forEach((input) => {
        input.checked = true;
      });
    } else {
      inputIds.forEach((input) => {
        input.checked = false;
      });
    }
  });
  inputIds.forEach((input) => {
    input.addEventListener("click", () => {
      const countChecked = checkboxMulti.querySelectorAll(
        "input[name='id']:checked"
      ).length;
      if (countChecked == inputIds.length) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }
    });
  });
}

//end checkbox-change-multi

//form-change-multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
  formChangeMulti.addEventListener("submit", (e) => {
    e.preventDefault();
    const checkboxMulti = document.querySelector("[checkbox-multi]");
    const inputChecked = checkboxMulti.querySelectorAll(
      "input[name='id']:checked"
    );

    const typeChange = e.target.elements.type.value;
    if (typeChange == "delete-all") {
      isConfirm = confirm("Ban co chac muon xoa khong?");
      if (!isConfirm) {
        return;
      }
    }
    if (inputChecked.length > 0) {
      let ids = [];
      let inputIds = formChangeMulti.querySelector("input[name='ids']");

      inputChecked.forEach((input) => {
        let id = input.value;
        if ((typeChange == "change-position")) {
          const position = input
            .closest("tr")
            .querySelector("input[name='position']").value;
            
            ids.push(`${id}-${position}`);
        } else {
          ids.push(id);
        }
      });
      console.log(ids.join(", "));
      inputIds.value = ids.join(", ");
    } else {
      alert("Vui long chon 1 san pham");
    }
     formChangeMulti.submit();
  });
}

//end form-change-multi

//button-delete
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
  const formDelete = document.querySelector("#form-delete-product");
  const path = formDelete.getAttribute("data-path");

  buttonsDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Ban co chac muon xoa san pham?");
      if (isConfirm) {
        const id = button.getAttribute("data-id");
        const action = `${path}/${id}?_method=DELETE`; //action de gui id len cho backend
        formDelete.action = action;
        formDelete.submit();
      }
    });
  });
}
//end button-delete
