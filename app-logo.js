const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const url = require('url');
const sharp = require('sharp'); // Import sharp for image processing

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the path to your company logo (modify as needed)
const LOGO_PATH = path.join(__dirname, 'logo.png');

app.route('/generate')
  .post(handleRequest)
  .get(handleRequest);

async function handleRequest(req, res) {
  try {
    let data, qrCodePath;

    if (req.method === 'POST') {
      ({ data, qrCodePath } = req.body);
    } else if (req.method === 'GET') {
      const parsedUrl = url.parse(req.url, true);
      data = parsedUrl.query.data;
      qrCodePath = parsedUrl.query.qrCodePath;
    }

    if (!data) {
      return res.status(400).json({ error: 'Missing required parameter: data' });
    }

    // Generate QR code buffer
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      margin: 4,
      type: 'png'
    });

    // Add company logo to QR code
    const qrWithLogoBuffer = await addLogoToQR(qrCodeBuffer, LOGO_PATH);

    // Handle saving or sending response
    if (qrCodePath) {
      const safeQrCodePath = path.join(qrCodePath);
      const safeDirectory = path.dirname(safeQrCodePath);
      fs.mkdirSync(safeDirectory, { recursive: true });
      fs.writeFileSync(safeQrCodePath, qrWithLogoBuffer);
      const qrCodeUrl = `${qrCodePath}`;
      res.json({ message: 'QR code generated and saved successfully', url: qrCodeUrl });
    } else {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(qrWithLogoBuffer);
    }

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: error.message || 'Failed to generate QR code' });
  }
}

async function addLogoToQR(qrBuffer, logoPath) {
  try {
    const qrImage = sharp(qrBuffer);
    const metadata = await qrImage.metadata();

    if (!fs.existsSync(logoPath)) {
      console.warn('?? Logo not found. Generating QR code without a logo.');
      return qrBuffer; // Return QR without logo
    }

    // Define max dimensions for the logo (as a percentage of the QR code)
    const maxLogoWidth = Math.floor(metadata.width * 0.3);  // Max 30% of QR width
    const maxLogoHeight = Math.floor(metadata.height * 0.2); // Max 20% of QR height

    // Resize the logo while keeping the aspect ratio within limits
    const logoBuffer = await sharp(logoPath)
      .resize({
        width: maxLogoWidth,
        height: maxLogoHeight,
        fit: 'inside', // Ensures the logo fits without cropping
      })
      .toBuffer();

    // Get the new logo size after resizing
    const logoMetadata = await sharp(logoBuffer).metadata();
    
    // Calculate center positioning
    const topPosition = Math.floor((metadata.height - logoMetadata.height) / 2);
    const leftPosition = Math.floor((metadata.width - logoMetadata.width) / 2);

    return await qrImage
      .composite([{
        input: logoBuffer,
        top: topPosition,
        left: leftPosition,
      }])
      .toBuffer();
  } catch (error) {
    console.error(`? Error adding logo: ${error.message}`);
    return qrBuffer; // Return QR without logo if an error occurs
  }
}

app.listen(port, () => {
  console.log(`QR Code Generator API listening at http://localhost:${port}`);
});
