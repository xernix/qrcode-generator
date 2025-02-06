# QR Code Generator API

This is a simple API built with Node.js and Express that generates QR code images. It supports both POST requests with JSON data and GET requests with URL parameters. It can either save the QR code to a file or return the image directly in the response.

## Features

- Generates QR codes from provided data.
- Supports saving QR codes to a specified path.
- Can return the QR code image directly in the response.
- Accepts data via POST request (JSON) or GET request (URL parameters).
- Uses Express.js for the API framework.
- Uses the `qrcode` library for QR code generation.
- Uses core Node.js modules (`path`, `fs`, `url`).

## Getting Started

### 1. Prerequisites

- Node.js (LTS version recommended)
- npm (Node Package Manager)

### 2. Installation

```bash
git clone https://git.pernec.com.my/DevOps/qrcode-generator.git
cd qrcode-generator
npm install express qrcode sharp path fs url
```

### 3. Running the API

- for qrcode without any logo embedded:
```bash
node app.js
```

- for qrcode with logo embedded.
- logo.png file must be in the same directory as app-logo.js

```bash
node app-logo.js
```

The API will listen on port 3001 (or the port specified in the `PORT` environment variable).

### 4. Running the Application in Production

#### Option 1: Running with pm2

```bash
npm install pm2 -g
pm2 start app.js --name "qrcode-generator"
pm2 startup  # Configure pm2 to start on boot (follow pm2 instructions)
pm2 save     # Save the pm2 process list
pm2 list     # List running processes
```

#### Option 2: Running as a systemd Service

This method provides tighter integration with the operating system and is suitable for applications that need to start automatically on boot and be managed as a system service.

1. **Create a systemd unit file:**

   ```bash
   sudo nano /etc/systemd/system/qrcode-generator.service
   ```

   Paste the following content into the file, adjusting the paths and user as needed:

   ```ini
   [Unit]
   Description=QR Code Generator Service NodeJS
   After=network.target

   [Service]
   User=your_user
   Group=your_group
   WorkingDirectory=/path/to/your/qrcode-generator
   ExecStart=/usr/bin/node /path/to/your/qrcode-generator/app.js > /var/log/qrcode-generator.log 2>&1
   Restart=on-failure
   RestartSec=5
   SyslogIdentifier=qrcode-generator

   [Install]
   WantedBy=multi-user.target
   ```

2. **Enable and start the service:**

   ```bash
   sudo systemctl enable qrcode-generator.service
   sudo systemctl start qrcode-generator.service
   sudo systemctl status qrcode-generator.service
   ```

3. **Check logs:**

   ```bash
   sudo journalctl -u qrcode-generator.service
   ```

4. **Other systemd commands:**

   ```bash
   sudo systemctl stop qrcode-generator.service
   sudo systemctl restart qrcode-generator.service
   ```

## API Endpoints

### `POST /generate` (JSON)

#### Request Body (JSON):

```json
{
  "data": "https://www.example.com",
  "qrCodePath": "/path/to/qr_code.png"
}
```

#### Response (JSON, if `qrCodePath` is provided):

```json
{
  "message": "QR code generated and saved successfully",
  "url": "/path/to/qr_code.png"
}
```

#### Response (PNG Image, if `qrCodePath` is not provided):

The QR code image will be returned directly in the response body with the `Content-Type: image/png` header.

---

### `GET /generate` (URL Parameters)

#### URL Parameters:

- `data`: **Required**: Data to encode in the QR code.
- `qrCodePath`: **Optional**: Path to save the QR code.

#### Response (JSON, if `qrCodePath` is provided):

```json
{
  "message": "QR code generated and saved successfully",
  "url": "/path/to/qr_code.png"
}
```

#### Response (PNG Image, if `qrCodePath` is not provided):

The QR code image will be returned directly in the response body with the `Content-Type: image/png` header.

## Examples

### `POST` Request (using curl)

#### Saving to file

```bash
curl -X POST -H "Content-Type: application/json" -d '{"data": "https://www.example.com", "qrCodePath": "my_qrcodes/qr_code_1.png"}' http://localhost:3001/generate
```

#### Getting the image directly

```bash
curl -X POST -H "Content-Type: application/json" -d '{"data": "https://www.example.com"}' http://localhost:3001/generate
```

### `GET` Request (using curl)

#### Saving to file

```bash
curl "http://localhost:3001/generate?data=https://www.example.com&qrCodePath=my_qrcodes/qr_code_1.png"
```

#### Getting the image directly

```bash
curl "http://localhost:3001/generate?data=https://www.example.com"
```

### `GET` Request (in browser)

```
http://localhost:3001/generate?data=https://www.example.com
```

## Deployment

For production deployment, it's recommended to use a process manager like `pm2` or a reverse proxy like Nginx or Apache.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT (Or your chosen license)
