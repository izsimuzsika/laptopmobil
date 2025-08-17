// Admin oldal GrapesJS editorral
const fileSelect = document.getElementById('fileSelect');
const saveBtn = document.getElementById('saveBtn');
let editor;

fetch('/api/list-files')
  .then(res => res.json())
  .then(files => {
    files.forEach(file => {
      const option = document.createElement('option');
      option.value = file;
      option.textContent = file;
      fileSelect.appendChild(option);
    });
  });

fileSelect.addEventListener('change', () => {
  fetch(`/api/load-file?name=${fileSelect.value}`)
    .then(res => res.text())
    .then(html => {
      if (!editor) {
        editor = grapesjs.init({
          container: '#gjs',
          fromElement: false,
          components: html,
          storageManager: false
        });
      } else {
        editor.setComponents(html);
      }
    });
});

saveBtn.addEventListener('click', () => {
  const html = editor.getHtml();
  fetch('/api/save-file', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: fileSelect.value, html})
  }).then(res => alert(res.ok ? 'Mentve!' : 'Hiba!'));
});
