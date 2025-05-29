document.addEventListener('DOMContentLoaded', () => {
  const signatureForm = document.getElementById("signatureForm");
  const nameInput = document.getElementById("name");
  const chucvuInput = document.getElementById("chucvu");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const previewDiv = document.getElementById("preview");
  const downloadBtn = document.getElementById("downloadBtn");
  const copyBtn = document.getElementById("copyBtn");
  const templateSelector = document.getElementById("templateSelector");

  let currentHtml = "";
  let currentTemplateContent = ""; // Biến lưu trữ nội dung template đã load

  // Danh sách các template có sẵn
  // 'name' là tên hiển thị, 'file' là tên file HTML của template
  const availableTemplates = [
    { name: "Mẫu CHS", file: "chs.html" },
    { name: "Mẫu HO", file: "ho.html" },
    // Thêm các mẫu khác vào đây
    // { name: "Mẫu XYZ", file: "xyz-template.html" }
  ];

  // Hàm để điền các lựa chọn vào dropdown
  function populateTemplateSelector() {
    availableTemplates.forEach(template => {
      const option = document.createElement("option");
      option.value = template.file;
      option.textContent = template.name;
      templateSelector.appendChild(option);
    });
    // Tự động load template đầu tiên
    if (availableTemplates.length > 0) {
      loadTemplate(availableTemplates[0].file);
    }
  }

  // Hàm để load nội dung của một file template
  async function loadTemplate(templateFile) {
    try {
      const response = await fetch(templateFile);
      if (!response.ok) {
        throw new Error(`Không thể tải template: ${response.statusText}`);
      }
      currentTemplateContent = await response.text();
      // Sau khi load template, nếu có dữ liệu form thì cập nhật preview
      if (nameInput.value) { 
        generateSignature();
      } else {
        previewDiv.innerHTML = '<i>Vui lòng chọn template và điền thông tin.</i>';
      }
    } catch (error) {
      console.error("Lỗi load template:", error);
      previewDiv.innerHTML = `<p style="color:red;">Lỗi: ${error.message}. Vui lòng kiểm tra console.</p>`;
      currentTemplateContent = ""; // Reset để tránh dùng template lỗi
    }
  }

  // Hàm tạo và hiển thị chữ ký
  function generateSignature() {
    if (!currentTemplateContent) {
      alert("Vui lòng chọn một mẫu chữ ký và đợi nó tải xong.");
      return;
    }

    const name = nameInput.value;
    const chucvu = chucvuInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;

    let filled = currentTemplateContent
      .replace(/{{name}}/g, name)
      .replace(/{{chucvu}}/g, chucvu)
      .replace(/{{email}}/g, email);

    // Xử lý placeholder {{phone}} và điều kiện {{#if phone}} (đơn giản)
    if (phone) {
        filled = filled.replace(/{{phone}}/g, phone)
                       .replace(/{{#if phone}}([\s\S]*?){{\/if}}/g, '$1'); // Giữ lại nội dung bên trong if
    } else {
        filled = filled.replace(/\(\+84\) {{phone}}/g, "") // Xóa cả prefix nếu phone rỗng cho template CHS
                       .replace(/{{phone}}/g, "") 
                       .replace(/{{#if phone}}([\s\S]*?){{\/if}}/g, ''); // Xóa toàn bộ khối if
    }


    currentHtml = filled;
    previewDiv.innerHTML = filled;
    downloadBtn.style.display = "inline-block";
    copyBtn.style.display = "inline-block";
  }

  // Sự kiện thay đổi template
  templateSelector.addEventListener("change", (e) => {
    loadTemplate(e.target.value);
  });

  // Sự kiện submit form
  signatureForm.addEventListener("submit", function(e) {
    e.preventDefault();
    generateSignature();
  });

  // Sự kiện copy
  copyBtn.addEventListener("click", () => {
    const range = document.createRange();
    range.selectNodeContents(previewDiv);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
      document.execCommand("copy");
      alert("Đã copy chữ ký!");
    } catch (err) {
      alert("Không thể copy. Vui lòng thử lại thủ công.");
    }
    selection.removeAllRanges();
  });

  // Sự kiện download
  downloadBtn.addEventListener("click", () => {
    if (!currentHtml) {
      alert("Chưa có chữ ký để tải.");
      return;
    }
    const blob = new Blob([currentHtml], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chu_ky_email.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  // Khởi tạo
  populateTemplateSelector();
});
