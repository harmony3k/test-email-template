
let currentHtml = "";

document.getElementById("signatureForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const title = document.getElementById("title").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const templateKey = document.getElementById("templateSelector").value;

  try {
    const template = await fetch(`${templateKey}.html`).then(res => res.text());

    const filled = template
      .replace(/{{name}}/g, name)
      .replace(/{{chucvu}}/g, title)
      .replace(/{{email}}/g, email)
      .replace(/{{phone}}/g, phone || "");

    currentHtml = filled;

    document.getElementById("preview").innerHTML = filled;
    document.getElementById("downloadBtn").style.display = "inline-block";
    document.getElementById("copyBtn").style.display = "inline-block";
  } catch (error) {
    alert("Không thể tải template. Hãy kiểm tra lại tên file template hoặc đường dẫn.");
  }
});

document.getElementById("downloadBtn").addEventListener("click", function () {
  if (!currentHtml) return;

  const name = document.getElementById("name").value;
  const blob = new Blob([currentHtml], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name.replace(/\s+/g, "_")}_signature.html`;
  link.click();
});

document.getElementById("copyBtn").addEventListener("click", function () {
  const previewDiv = document.getElementById("preview");

  const range = document.createRange();
  range.selectNodeContents(previewDiv);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    document.execCommand("copy");
    alert("Đã copy chữ ký!");
  } catch (err) {
    alert("Không thể copy. Vui lòng thử lại.");
  }

  selection.removeAllRanges();
});
