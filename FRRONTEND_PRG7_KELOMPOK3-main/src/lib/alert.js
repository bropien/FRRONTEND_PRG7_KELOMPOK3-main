import swal from "sweetalert";

const showAlert = async ({
  title,
  text,
  icon,
  confirmText = "",
  inputType = null,
  placeholder = "",
}) => {
  if (!confirmText) {
    return swal({ title, text, icon });
  }

  let textContent = "";

  const swalOptions = {
    title,
    text,
    icon,
    buttons: {
      cancel: "Batal",
      confirm: {
        text: confirmText,
        value: true,
      },
    },
    dangerMode: icon === "warning",
  };

  if (inputType) {
    swalOptions.content = {
      element: inputType,
      attributes: {
        placeholder,
        onchange: (e) => {
          textContent = e.target.value;
        },
      },
    };
  }

  const value = await swal(swalOptions);

  if (inputType && value) {
    return textContent === "" ? "-" : textContent;
  }
  return value;
};

export default showAlert;
