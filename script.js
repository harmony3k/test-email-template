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
  let currentTemplateContent = "";

  const availableTemplates = [
    { name: "Mẫu CHS", file: "chs.html" }, // Đảm bảo tên file chính xác
    { name: "Mẫu HO", file: "ho.html" },   // Đảm bảo tên file chính xác
  ];

  function populateTemplateSelector() {
    availableTemplates.forEach(template => {
      const option = document.createElement("option");
      option.value = template.file;
      option.textContent = template.name;
      templateSelector.appendChild(option);
    });
    if (availableTemplates.length > 0) {
      loadTemplate(availableTemplates[0].file);
    }
  }

  async function loadTemplate(templateFile) {
    try {
      // ---- SỬA ĐỔI Ở ĐÂY ----
      const response = await fetch(`./${templateFile}`);
      // ---- KẾT THÚC SỬA ĐỔI ----
      if (!response.ok) {
        // Thêm thông tin URL vào lỗi để dễ debug
        throw new Error(`Không thể tải template: ${response.statusText} (URL: ${response.url})`);
      }
      currentTemplateContent = await response.text();
      if (nameInput.value || chucvuInput.value || emailInput.value || phoneInput.value) {
        generateSignature();
      } else {
        previewDiv.innerHTML = '<i>Vui lòng chọn template và điền thông tin.</i>';
      }
    } catch (error) {
      console.error("Lỗi load template:", error);
      previewDiv.innerHTML = `<p style="color:red;">Lỗi: ${error.message}. Vui lòng kiểm tra console.</p>`;
      currentTemplateContent = "";
    }
  }

  function generateSignature() {
    if (!currentTemplateContent) {
      alert("Vui lòng chọn một mẫu chữ ký và đợi nó tải xong, hoặc kiểm tra lỗi ở console.");
      previewDiv.innerHTML = `<p style="color:red;">Chưa có nội dung template. Vui lòng chọn lại hoặc kiểm tra lỗi.</p>`;
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

    if (phone) {
        filled = filled.replace(/{{phone}}/g, phone)
                       .replace(/{{#if phone}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
        filled = filled.replace(/\(\+84\) {{phone}}/g, "")
                       .replace(/{{phone}}/g, "")
                       .replace(/{{#if phone}}([\s\S]*?){{\/if}}/g, '');
    }

    currentHtml = filled;
    previewDiv.innerHTML = filled;
    downloadBtn.style.display = "inline-block";
    copyBtn.style.display = "inline-block";
  }

  templateSelector.addEventListener("change", (e) => {
    loadTemplate(e.target.value);
  });

  signatureForm.addEventListener("submit", function(e) {
    e.preventDefault();
    generateSignature();
  });

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

  populateTemplateSelector();
});
