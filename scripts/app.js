const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const textOutput = document.getElementById('textOutput');
const processingOverlay = document.getElementById('processingOverlay');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// File input change
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleFile(fileInput.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }
    previewSection.innerHTML = '';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    img.className = 'preview-img';
    previewSection.appendChild(img);

    extractTextFromImage(file);
}

function extractTextFromImage(file) {
    processingOverlay.style.display = 'flex';
    textOutput.textContent = '';
    progressBar.style.width = '0%';
    statusText.textContent = 'Processing Image...';

    Tesseract.recognize(
        file,
        'eng',
        {
            logger: m => {
                if (m.status === 'recognizing text') {
                    progressBar.style.width = `${Math.round(m.progress * 100)}%`;
                    statusText.textContent = `Extracting Text... (${Math.round(m.progress * 100)}%)`;
                }
            }
        }
    ).then(({ data: { text } }) => {
        textOutput.textContent = text.trim();
        processingOverlay.style.display = 'none';
    }).catch(err => {
        textOutput.textContent = 'Failed to extract text.';
        processingOverlay.style.display = 'none';
    });
}

// Copy to clipboard
copyBtn.addEventListener('click', () => {
    const text = textOutput.textContent;
    if (text) {
        navigator.clipboard.writeText(text);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy Text', 1500);
    }
});

downloadBtn.addEventListener('click', () => {
    const text = textOutput.textContent;
    if (text) {
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'extracted-text.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    }
});