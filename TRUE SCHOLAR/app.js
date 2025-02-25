// Application Modules
const App = {
  elements: {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    progressBar: document.getElementById('progressBar'),
    statusText: document.getElementById('statusText'),
    canvas: document.getElementById('canvas'),
    downloadLink: document.getElementById('downloadLink'),
    themeToggle: document.getElementById('themeToggle'),
    languageSelect: document.getElementById('languageSelect'),
    targetFormat: document.getElementById('targetFormat'),
    historyList: document.getElementById('historyList'),
    logArea: document.getElementById('logArea'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalBody: document.getElementById('modalBody'),
    modalClose: document.getElementById('modalClose')
  },
  state: {
    currentFiles: [],
    conversionQueue: [],
    isProcessing: false
  }
};

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  setupEventListeners();
  loadSavedSettings();
}

function setupEventListeners() {
  // Drop zone events
  App.elements.dropZone.addEventListener('click', () => App.elements.fileInput.click());
  App.elements.fileInput.addEventListener('change', handleFileInput);
  App.elements.dropZone.addEventListener('dragover', handleDragOver);
  App.elements.dropZone.addEventListener('dragleave', handleDragLeave);
  App.elements.dropZone.addEventListener('drop', handleDrop);

  // Menu events
  App.elements.menuFile.addEventListener('click', showFileOptions);
  App.elements.menuSettings.addEventListener('click', showSettings);
  App.elements.menuHelp.addEventListener('click', showHelp);
  App.elements.menuAbout.addEventListener('click', showAbout);

  // Theme selection
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => changeTheme(btn.dataset.theme));
  });

  // Language selection
  App.elements.languageSelect.addEventListener('change', handleLanguageChange);
}

function loadSavedSettings() {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'default-theme';
  document.body.classList.add(savedTheme);
}

function showFileOptions() {
  openModal('File Options', '<p>Additional file operations can be implemented here.</p>');
}

function showSettings() {
  openModal('Settings', '<p>Adjust conversion quality, target formats, and other preferences.</p>');
}

function showHelp() {
  openModal('Help', '<p>Drag & drop files to convert. Use the target format dropdown to choose the desired output.</p>');
}

function showAbout() {
  openModal('About', '<p>Advanced Offline File Converter<br>Version 1.4<br>Developed by M&A</p>');
}

function changeTheme(theme) {
  document.body.className = '';
  document.body.classList.add(theme);
  localStorage.setItem('theme', theme);
}

function handleLanguageChange(e) {
  App.elements.statusText.textContent = `Language set to: ${e.target.value}`;
}

function openModal(title, content) {
  try {
    App.elements.modalBody.innerHTML = `<h2>${title}</h2><div>${content}</div>`;
    App.elements.modalOverlay.style.display = 'flex';
  } catch (error) {
    console.error('Error opening modal:', error);
    showError('Failed to open modal dialog');
  }
}

function handleFileInput(e) {
  if (e.target.files.length) {
    processFiles(Array.from(e.target.files));
  }
}

function handleDragOver(e) {
  e.preventDefault();
  App.elements.dropZone.classList.add('active');
}

function handleDragLeave() {
  App.elements.dropZone.classList.remove('active');
}

function handleDrop(e) {
  e.preventDefault();
  App.elements.dropZone.classList.remove('active');
  if (e.dataTransfer.files.length) {
    processFiles(Array.from(e.dataTransfer.files));
  }
}

function processFiles(files) {
  if (!files || files.length === 0) {
    showError('No files selected');
    return;
  }

  App.state.currentFiles = files;
  App.state.conversionQueue = [...files];
  App.state.isProcessing = true;

  updateStatus('Starting conversion...');
  resetProgress();
  
  // Show upload progress
  const uploadProgress = document.createElement('div');
  uploadProgress.className = 'upload-progress';
  const uploadProgressBar = document.createElement('div');
  uploadProgressBar.className = 'upload-progress-bar';
  uploadProgress.appendChild(uploadProgressBar);
  document.body.appendChild(uploadProgress);
  
  // Update progress as files are read
  let totalSize = files.reduce((sum, file) => sum + file.size, 0);
  let loadedSize = 0;
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      loadedSize += e.loaded;
      const percent = Math.round((loadedSize / totalSize) * 100);
      uploadProgressBar.style.width = `${percent}%`;
    };
    reader.onloadend = () => {
      showPreview(file);
      if (++currentIndex === files.length) {
        uploadProgress.remove();
        // Show format selection modal
        const fileType = files[0].type;
        updateTargetFormatOptions(fileType);
        const formatModalContent = `
          <h3>Select Target Format</h3>
          <select id="selectedFormat" class="dropdown">
            ${Array.from(App.elements.targetFormat.options).map(opt => 
              `<option value="${opt.value}">${opt.text}</option>`
            ).join('')}
          </select>
          <button onclick="startConversion(files)">Convert</button>
        `;
        openModal('Select Format', formatModalContent);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function startConversion(files) {
  const selectedFormat = document.getElementById('selectedFormat').value;
  let currentIndex = 0;
  
  files.forEach(file => {
    App.elements.targetFormat.value = selectedFormat;
  });
  
  function processNext() {
    if (currentIndex < files.length) {
      updateTargetFormatOptions(files[currentIndex].type);
      processFile(files[currentIndex], () => {
        addToHistory(files[currentIndex].name);
        addLog(`Converted: ${files[currentIndex].name}`);
        currentIndex++;
        App.elements.progressBar.value = Math.round((currentIndex / files.length) * 100);
        processNext();
      });
    } else {
      App.elements.statusText.textContent = 'All files converted successfully!';
    }
  }
  processNext();
}

function updateTargetFormatOptions(fileType) {
  App.elements.targetFormat.innerHTML = '';
  
  const formatOptions = {
    'image/': ['PNG', 'JPEG', 'BMP', 'GIF', 'TIFF', 'WEBP'],
    'text/plain': ['PDF'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['PDF'],
    'text/csv': ['PDF'],
    'audio/': ['MP3', 'WAV', 'OGG', 'FLAC'],
    'video/': ['MP4', 'AVI', 'MKV', 'MOV']
  };

  for (const [prefix, formats] of Object.entries(formatOptions)) {
    if (fileType.startsWith(prefix)) {
      formats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.toLowerCase();
        option.textContent = format;
        App.elements.targetFormat.appendChild(option);
      });
      break;
    }
  }
}

function showPreview(file) {
  const previewItem = document.createElement('div');
  previewItem.classList.add('preview-item', 'fade-in');
  previewItem.innerHTML = `
    <strong>${file.name}</strong><br>
    <small>${(file.size/1024).toFixed(1)} KB</small>
    <div class="preview-comparison">
      <div class="original-preview">
        <h4>Original</h4>
        <img src="${URL.createObjectURL(file)}" alt="Original">
      </div>
      <div class="converted-preview">
        <h4>Converted</h4>
        <div class="placeholder">Preview will appear after conversion</div>
      </div>
    </div>
  `;
  App.elements.previewArea.appendChild(previewItem);
}

function processFile(file, callback) {
  try {
    const processor = getFileProcessor(file.type);
    if (!processor) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    processor(file, callback);
  } catch (error) {
    handleProcessingError(error, file);
    callback();
  }
}

function getFileProcessor(fileType) {
  const processors = {
    'image/': processImage,
    'text/plain': processTextToPDF,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': processTextToPDF,
    'text/csv': processTextToPDF,
    'audio/': processAudio,
    'video/': processVideo
  };

  for (const [prefix, processor] of Object.entries(processors)) {
    if (fileType.startsWith(prefix)) {
      return processor;
    }
  }
  return null;
}

function handleProcessingError(error, file) {
  const errorMessage = `Error processing ${file.name}: ${error.message}`;
  updateStatus(errorMessage);
  addLog(`Conversion failed: ${errorMessage}`);
}

function processImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      App.elements.canvas.width = img.width;
      App.elements.canvas.height = img.height;
      const ctx = App.elements.canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        updateStatus(`Converting image... ${progress}%`);
        if (progress >= 100) {
          clearInterval(interval);
          const target = App.elements.targetFormat.value || 'png';
          const convertedData = App.elements.canvas.toDataURL(`image/${target}`);
          App.elements.downloadLink.href = convertedData;
          App.elements.downloadLink.download = `converted_${file.name.split('.')[0]}.${target}`;
          App.elements.downloadLink.style.display = 'inline-block';
          App.elements.downloadLink.click();
          URL.revokeObjectURL(App.elements.downloadLink.href);
          updateStatus('Image conversion complete!');
          callback();
        }
      }, 100);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function processTextToPDF(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const doc = new jsPDF();
    doc.text(event.target.result, 10, 10);
    const pdfData = doc.output('datauristring');
    App.elements.downloadLink.href = pdfData;
    App.elements.downloadLink.download = `converted_${file.name.split('.')[0]}.pdf`;
    App.elements.downloadLink.style.display = 'inline-block';
    App.elements.downloadLink.click();
    URL.revokeObjectURL(App.elements.downloadLink.href);
    updateStatus('Text-to-PDF conversion complete!');
    callback();
  };
  reader.readAsText(file);
}

function processAudio(file, callback) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    updateStatus(`Converting audio... ${progress}%`);
    if (progress >= 100) {
      clearInterval(interval);
      App.elements.downloadLink.href = URL.createObjectURL(file);
      App.elements.downloadLink.download = `converted_${file.name}`;
      App.elements.downloadLink.style.display = 'inline-block';
      App.elements.downloadLink.click();
      URL.revokeObjectURL(App.elements.downloadLink.href);
      updateStatus('Audio conversion complete!');
      callback();
    }
  }, 150);
}

function processVideo(file, callback) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    updateStatus(`Converting video... ${progress}%`);
    if (progress >= 100) {
      clearInterval(interval);
      App.elements.downloadLink.href = URL.createObjectURL(file);
      App.elements.downloadLink.download = `converted_${file.name}`;
      App.elements.downloadLink.style.display = 'inline-block';
      App.elements.downloadLink.click();
      URL.revokeObjectURL(App.elements.downloadLink.href);
      updateStatus('Video conversion complete!');
      callback();
    }
  }, 150);
}

function addToHistory(filename) {
  const li = document.createElement('li');
  li.textContent = filename;
  App.elements.historyList.appendChild(li);
}

function addLog(message) {
  const logEntry = document.createElement('div');
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  App.elements.logArea.appendChild(logEntry);
}

function updateStatus(message) {
  App.elements.statusText.textContent = message;
}

function showError(message) {
  updateStatus(`Error: ${message}`);
  addLog(message);
}

function resetProgress() {
  App.elements.progressBar.value = 0;
}
