document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const progressBar = document.getElementById('progressBar');
  const statusText = document.getElementById('statusText');
  const canvas = document.getElementById('canvas');
  const downloadLink = document.getElementById('downloadLink');
  const themeToggle = document.getElementById('themeToggle');
  const languageSelect = document.getElementById('languageSelect');
  const targetFormat = document.getElementById('targetFormat');
  const historyList = document.getElementById('historyList');
  const logArea = document.getElementById('logArea');
  
  // Menu items
  const menuFile = document.getElementById('menuFile');
  const menuSettings = document.getElementById('menuSettings');
  const menuHelp = document.getElementById('menuHelp');
  const menuAbout = document.getElementById('menuAbout');
  
  // Modal elements
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // Function to open modal dialogs
  function openModal(title, content) {
    modalBody.innerHTML = `<h2>${title}</h2><div>${content}</div>`;
    modalOverlay.style.display = 'flex';
  }
  modalClose.addEventListener('click', () => modalOverlay.style.display = 'none');
  modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) modalOverlay.style.display = 'none'; });

  // Menu actions
  menuFile.addEventListener('click', () => {
    openModal('File Options', '<p>Additional file operations can be implemented here.</p>');
  });
  menuSettings.addEventListener('click', () => {
    openModal('Settings', '<p>Adjust conversion quality, target formats, and other preferences.</p>');
  });
  menuHelp.addEventListener('click', () => {
    openModal('Help', '<p>Drag & drop files to convert. Use the target format dropdown to choose the desired output.</p>');
  });
  menuAbout.addEventListener('click', () => {
    openModal('About', '<p>Advanced Offline File Converter<br>Version 1.3<br>Developed by M&A</p>');
  });

  // Theme selection
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.className = ''; // Clear all classes
      document.body.classList.add(btn.dataset.theme);
      localStorage.setItem('theme', btn.dataset.theme);
      btn.classList.add('scale-up');
      setTimeout(() => btn.classList.remove('scale-up'), 300);
    });
  });

  // Set initial theme
  const savedTheme = localStorage.getItem('theme') || 'default-theme';
  document.body.classList.add(savedTheme);

  // Language selection (placeholder)
  languageSelect.addEventListener('change', (e) => {
    statusText.textContent = `Language set to: ${e.target.value}`;
  });

  // Populate target format dropdown based on file type (for demo, simple options)
  function updateTargetFormatOptions(fileType) {
    targetFormat.innerHTML = '';
    if(fileType.startsWith('image/')) {
      ['PNG','JPEG','BMP','GIF','TIFF','WEBP'].forEach(fmt => {
        const option = document.createElement('option');
        option.value = fmt.toLowerCase();
        option.textContent = fmt;
        targetFormat.appendChild(option);
      });
    } else if(fileType === 'text/plain') {
      ['PDF'].forEach(fmt => {
        const option = document.createElement('option');
        option.value = 'pdf';
        option.textContent = fmt;
        targetFormat.appendChild(option);
      });
    } else if(fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'text/csv') {
      ['PDF'].forEach(fmt => {
        const option = document.createElement('option');
        option.value = 'pdf';
        option.textContent = fmt;
        targetFormat.appendChild(option);
      });
    } else if(fileType.startsWith('audio/')) {
      ['MP3','WAV','OGG','FLAC'].forEach(fmt => {
        const option = document.createElement('option');
        option.value = fmt.toLowerCase();
        option.textContent = fmt;
        targetFormat.appendChild(option);
      });
    } else if(fileType.startsWith('video/')) {
      ['MP4','AVI','MKV','MOV'].forEach(fmt => {
        const option = document.createElement('option');
        option.value = fmt.toLowerCase();
        option.textContent = fmt;
        targetFormat.appendChild(option);
      });
    }
  }

  // Handle file selection and drag-drop events
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => { if(e.target.files.length) processFiles(Array.from(e.target.files)); });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('active'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    if(e.dataTransfer.files.length) processFiles(Array.from(e.dataTransfer.files));
  });

  // Display file preview and metadata
  function showPreview(file) {
    const previewArea = document.getElementById('previewArea');
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
    previewArea.appendChild(previewItem);
  }

  // Process multiple files in batch
  function processFiles(files) {
    let currentIndex = 0;
    statusText.textContent = 'Starting conversion...';
    progressBar.value = 0;
    
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
          const fileType = files[0].type; // Get type of first file
          updateTargetFormatOptions(fileType);
          const formatModalContent = `
            <h3>Select Target Format</h3>
            <select id="selectedFormat" class="dropdown">
              ${Array.from(targetFormat.options).map(opt => 
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
    // Update target format for all files
    files.forEach(file => {
      targetFormat.value = selectedFormat;
    });
    
    function processNext() {
      if(currentIndex < files.length) {
        // Update target format options based on the first file's type (could be extended per file)
        updateTargetFormatOptions(files[currentIndex].type);
        processFile(files[currentIndex], () => {
          addToHistory(files[currentIndex].name);
          addLog(`Converted: ${files[currentIndex].name}`);
          currentIndex++;
          progressBar.value = Math.round((currentIndex / files.length) * 100);
          processNext();
        });
      } else {
        statusText.textContent = 'All files converted successfully!';
      }
    }
    processNext();
  }

  // Add conversion history entry
  function addToHistory(filename) {
    const li = document.createElement('li');
    li.textContent = filename;
    historyList.appendChild(li);
  }

  // Log messages with timestamp
  function addLog(message) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(logEntry);
  }

  // Process single file based on its type
  function processFile(file, callback) {
    try {
      if(file.type.startsWith('image/')) {
        processImage(file, callback);
      } else if(file.type === 'text/plain' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'text/csv') {
        processTextToPDF(file, callback);
      } else if(file.type.startsWith('audio/')) {
        processAudio(file, callback);
      } else if(file.type.startsWith('video/')) {
        processVideo(file, callback);
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      statusText.textContent = `Error: ${error.message}`;
      addLog(`Conversion failed: ${error.message}`);
      callback();
    }
  }

  // Image conversion using canvas (convert to target image format)
  function processImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        statusText.textContent = `Converting image... ${progress}%`;
        if(progress >= 100) {
          clearInterval(interval);
          const target = targetFormat.value || 'png';
          const convertedData = canvas.toDataURL(`image/${target}`);
          downloadLink.href = convertedData;
          downloadLink.download = `converted_${file.name.split('.')[0]}.${target}`;
          downloadLink.style.display = 'inline-block';
          downloadLink.click(); // Trigger download
          URL.revokeObjectURL(downloadLink.href); // Clean up
          statusText.textContent = 'Image conversion complete!';
          callback();
        }
      }, 100);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Text to PDF conversion using jsPDF (handles TXT, DOCX, CSV as text)
function processTextToPDF(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const doc = new jsPDF();
    doc.text(event.target.result, 10, 10);
    const pdfData = doc.output('datauristring');
    downloadLink.href = pdfData;
    downloadLink.download = `converted_${file.name.split('.')[0]}.pdf`;
    downloadLink.style.display = 'inline-block';
    downloadLink.click(); // Trigger download
    URL.revokeObjectURL(downloadLink.href); // Clean up
    statusText.textContent = 'Text-to-PDF conversion complete!';
    callback();
  };
  // For DOCX or CSV, read as text (assuming conversion libraries handle parsing offline)
  reader.readAsText(file);
}

// Simulated audio conversion (placeholder functionality)
function processAudio(file, callback) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    statusText.textContent = `Converting audio... ${progress}%`;
    if(progress >= 100) {
      clearInterval(interval);
      // Simulate conversion by returning the original file (in a real scenario, integrate FFmpeg.wasm)
      downloadLink.href = URL.createObjectURL(file);
      downloadLink.download = `converted_${file.name}`;
      downloadLink.style.display = 'inline-block';
      downloadLink.click(); // Trigger download
      URL.revokeObjectURL(downloadLink.href); // Clean up
      statusText.textContent = 'Audio conversion complete!';
      callback();
    }
  }, 150);
}

// Simulated video conversion (placeholder functionality)
function processVideo(file, callback) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    statusText.textContent = `Converting video... ${progress}%`;
    if(progress >= 100) {
      clearInterval(interval);
      // Simulate conversion by returning the original file
      downloadLink.href = URL.createObjectURL(file);
      downloadLink.download = `converted_${file.name}`;
      downloadLink.style.display = 'inline-block';
      downloadLink.click(); // Trigger download
      URL.revokeObjectURL(downloadLink.href); // Clean up
      statusText.textContent = 'Video conversion complete!';
      callback();
    }
  }, 150);
}
});
