// Phone number formatting
function formatPhoneNumber(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
        let formatted = numbers;
        if (numbers.length > 2) {
            formatted = `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
        }
        if (numbers.length > 7) {
            formatted = formatted.substring(0, 10) + '-' + formatted.substring(10);
        }
        return formatted;
    }
    return value.substring(0, 15);
}

// Phone validation
function isValidPhone(phone) {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 11;
}

// Initialize elements
const firstScreen = document.getElementById('firstScreen');
const secondScreen = document.getElementById('secondScreen');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');
const generateBtn = document.getElementById('generateBtn');
const generatedLinkInput = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');
const notification = document.getElementById('notification');
const newLinkBtn = document.getElementById('newLinkBtn');
const phoneError = document.getElementById('phoneError');
const qrcodeElement = document.getElementById('qrcode');
const downloadSvgBtn = document.getElementById('downloadSvg');
const downloadPngBtn = document.getElementById('downloadPng');

let qrCodeInstance = null;

// Phone input formatting
phoneInput.addEventListener('input', (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
    
    if (formatted.replace(/\D/g, '').length === 11) {
        phoneError.style.display = 'none';
    }
});

// Generate WhatsApp link
function generateWhatsAppLink(phone, message) {
    const phoneNumber = phone.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/55${phoneNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

// Generate QR Code
function generateQRCode(text) {
    qrcodeElement.innerHTML = '';
    
    const typeNumber = 0;
    const errorCorrectionLevel = 'H';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(text);
    qr.make();
    
    const cellSize = 8;
    const margin = 4;
    const size = qr.getModuleCount() * cellSize + margin * 2;
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR Code
    ctx.fillStyle = '#000000';
    for (let row = 0; row < qr.getModuleCount(); row++) {
        for (let col = 0; col < qr.getModuleCount(); col++) {
            if (qr.isDark(row, col)) {
                ctx.fillRect(
                    col * cellSize + margin,
                    row * cellSize + margin,
                    cellSize,
                    cellSize
                );
            }
        }
    }
    
    qrcodeElement.appendChild(canvas);
}

// Show notification
function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Generate link and show second screen
generateBtn.addEventListener('click', () => {
    const phone = phoneInput.value;
    
    if (!isValidPhone(phone)) {
        phoneError.textContent = 'Digite um número de telefone válido (11 dígitos)';
        phoneError.style.display = 'block';
        return;
    }

    const link = generateWhatsAppLink(phone, messageInput.value);
    generatedLinkInput.value = link;
    generateQRCode(link);
    
    firstScreen.classList.remove('active');
    secondScreen.classList.add('active');
});

// Copy link to clipboard
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(generatedLinkInput.value);
        showNotification();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});

// Return to first screen
newLinkBtn.addEventListener('click', () => {
    phoneInput.value = '';
    messageInput.value = '';
    phoneError.style.display = 'none';
    qrcodeElement.innerHTML = '';
    secondScreen.classList.remove('active');
    firstScreen.classList.add('active');
});

// Download QR Code as PNG
downloadPngBtn.addEventListener('click', () => {
    const canvas = qrcodeElement.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'whatsapp-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

// Download QR Code as SVG
downloadSvgBtn.addEventListener('click', () => {
    const canvas = qrcodeElement.querySelector('canvas');
    if (canvas) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const size = canvas.width;
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        
        // Add white background
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', '#FFFFFF');
        svg.appendChild(background);
        
        // Convert canvas to image data
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Create path for QR code
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = '';
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4;
                const isBlack = data[idx] === 0 && data[idx + 1] === 0 && data[idx + 2] === 0;
                
                if (isBlack) {
                    d += `M${x},${y}h1v1h-1z`;
                }
            }
        }
        
        path.setAttribute('d', d);
        path.setAttribute('fill', '#000000');
        svg.appendChild(path);
        
        // Convert SVG to blob and download
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(svgBlob);
        link.download = 'whatsapp-qr.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});