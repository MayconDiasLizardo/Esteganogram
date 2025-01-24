const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const messageInput = document.getElementById('messageInput');
const encodeButton = document.getElementById('encodeButton');
const decodeButton = document.getElementById('decodeButton');
const decodedMessage = document.getElementById('decodedMessage');
const downloadLink = document.getElementById('downloadLink');

let context, image;

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        context = imageCanvas.getContext('2d');
        context.drawImage(img, 0, 0);
        image = context.getImageData(0, 0, img.width, img.height);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

encodeButton.addEventListener('click', () => {
  if (!image || !messageInput.value) {
    alert('Please upload an image and enter a message.');
    return;
  }
  const binary = textToBinary(messageInput.value);
  const lengthBinary = binary.length.toString(2).padStart(32, '0');
  const fullBinary = lengthBinary + binary;

  const pixels = image.data;
  let binaryIndex = 0;

  for (let i = 0; i < pixels.length && binaryIndex < fullBinary.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      if (binaryIndex < fullBinary.length) {
        pixels[i + j] = (pixels[i + j] & 254) | (fullBinary[binaryIndex] === '1' ? 1 : 0);
        binaryIndex++;
      }
    }
  }

  context.putImageData(image, 0, 0);
  downloadLink.href = imageCanvas.toDataURL();
  downloadLink.style.display = 'inline-block';
});

decodeButton.addEventListener('click', () => {
  if (!image) {
    alert('Please upload an image first.');
    return;
  }

  const pixels = image.data;
  let binary = '';

  for (let i = 0; i < pixels.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      binary += (pixels[i + j] & 1).toString();
    }
  }

  const length = parseInt(binary.slice(0, 32), 2);
  const messageBinary = binary.slice(32, 32 + length);
  decodedMessage.value = binaryToText(messageBinary);
});

function textToBinary(text) {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

function binaryToText(binary) {
  const chunks = binary.match(/.{1,8}/g) || [];
  return chunks
    .map((chunk) => String.fromCharCode(parseInt(chunk, 2)))
    .join('');
}
// Atualize o script.js com o seguinte código
const cameraButton = document.getElementById('cameraButton');
const videoElement = document.createElement('video');
const capturedImageContainer = document.createElement('div');
capturedImageContainer.style.textAlign = 'center';
capturedImageContainer.style.marginTop = '10px';
let cameraStream;

// Botão para abrir a câmera
cameraButton.addEventListener('click', async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Câmera não suportada no seu dispositivo ou navegador.');
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = cameraStream;
    videoElement.setAttribute('autoplay', true);
    videoElement.setAttribute('playsinline', true);
    videoElement.style.maxWidth = '100%';
    document.querySelector('.app-container').appendChild(videoElement);

    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.justifyContent = 'center';
    actionContainer.style.gap = '10px';
    actionContainer.style.marginTop = '10px';

    const captureButton = document.createElement('button');
    captureButton.innerText = 'Capturar Foto';
    captureButton.classList.add('button');
    actionContainer.appendChild(captureButton);

    const downloadButton = document.createElement('a');
    downloadButton.innerText = 'Baixar Imagem Codificada';
    downloadButton.classList.add('button', 'download');
    downloadButton.style.display = 'none';
    actionContainer.appendChild(downloadButton);

    document.querySelector('.app-container').appendChild(actionContainer);

    const previewImage = new Image();
    previewImage.style.display = 'block';
    previewImage.style.margin = '10px auto';
    previewImage.style.maxWidth = '60%';
    previewImage.style.border = '2px solid #555';
    previewImage.style.borderRadius = '8px';
    capturedImageContainer.appendChild(previewImage);
    document.querySelector('.app-container').appendChild(capturedImageContainer);

    captureButton.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Exibir a imagem capturada
      imageCanvas.width = canvas.width;
      imageCanvas.height = canvas.height;
      context = imageCanvas.getContext('2d');
      context.drawImage(canvas, 0, 0);

      // Atualizar a imagem de pré-visualização
      previewImage.src = canvas.toDataURL();

      // Codificar automaticamente a imagem com uma mensagem
      const defaultMessage = 'Mensagem secreta automática';
      const binary = textToBinary(defaultMessage);
      const lengthBinary = binary.length.toString(2).padStart(32, '0');
      const fullBinary = lengthBinary + binary;

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let binaryIndex = 0;
      for (let i = 0; i < pixels.length && binaryIndex < fullBinary.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          if (binaryIndex < fullBinary.length) {
            pixels[i + j] = (pixels[i + j] & 254) | (fullBinary[binaryIndex] === '1' ? 1 : 0);
            binaryIndex++;
          }
        }
      }

      context.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);

      // Preparar link para download
      downloadButton.href = canvas.toDataURL();
      downloadButton.style.display = 'inline-block';
      downloadButton.download = 'imagem-codificada.png';

      // Parar a câmera
      cameraStream.getTracks().forEach((track) => track.stop());
      videoElement.remove();
      captureButton.remove();
    });
  } catch (error) {
    console.error('Erro ao acessar a câmera:', error);
    alert('Erro ao acessar a câmera.');
  }
});

function textToBinary(text) {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}
