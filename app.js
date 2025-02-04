const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const url = require('url'); // Import the URL module

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Enable parsing of URL-encoded data

//const QR_CODE_DIRECTORY = path.join(__dirname, 'qrcodes');
//fs.mkdirSync(QR_CODE_DIRECTORY, { recursive: true });

app.route('/generate') // Use app.route to handle both POST and GET
  .post(handleRequest)
  .get(handleRequest);


async function handleRequest(req, res) {
  try {
    let data, qrCodePath;

    if (req.method === 'POST') {
      ({ data, qrCodePath } = req.body);
    } else if (req.method === 'GET') {
      const parsedUrl = url.parse(req.url, true); // Parse URL
      data = parsedUrl.query.data;
      qrCodePath = parsedUrl.query.qrCodePath;
    }

    if (!data) {
      return res.status(400).json({ error: 'Missing required parameter: data' });
    }

    const qrCodeBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      margin: 4,
      type: 'png'
    });

    if (qrCodePath) {
      const safeQrCodePath = path.join(qrCodePath);
      const safeDirectory = path.dirname(safeQrCodePath);
      fs.mkdirSync(safeDirectory, { recursive: true });
      fs.writeFileSync(safeQrCodePath, qrCodeBuffer);
      const qrCodeUrl = `${qrCodePath}`;
      res.json({ message: 'QR code generated and saved successfully', url: qrCodeUrl });
    } else {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(qrCodeBuffer);
    }

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
}

//app.use('/qrcodes', express.static(QR_CODE_DIRECTORY));

app.listen(port, () => {
  console.log(`QR Code Generator API listening at http://localhost:${port}`);
});
