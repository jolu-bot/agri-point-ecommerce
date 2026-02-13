// scripts/generate-qr-codes.js
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateCampaignQRCodes() {
  console.log('\n🔄 Generating QR codes...\n');

  const urls = {
    'campaign': 'https://agri-point.cm/campagne-engrais',
    'mobileApp': 'https://agri-point.cm/campagne-engrais?mobile=true',
    'admin': 'https://agri-point.cm/admin/campaigns',
  };

  // Create directory
  const qrDir = path.join(process.cwd(), 'public', 'qrcodes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
    console.log(`✅ Created directory: ${qrDir}\n`);
  }

  // Generate QR codes
  try {
    for (const [name, url] of Object.entries(urls)) {
      const filePath = path.join(qrDir, `qrcode-${name}.png`);
      
      // Generate QR code as data URL
      await QRCode.toFile(filePath, url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const stats = fs.statSync(filePath);
      console.log(`✅ Generated: qrcode-${name}.png (${(stats.size / 1024).toFixed(2)} KB)`);
    }

    console.log('\n✨ QR Code generation complete!');
    console.log(`📁 Location: ${qrDir}`);
    console.log(`📊 Total: 3 QR codes generated`);
    console.log('\n🔗 URLs encoded:');
    Object.entries(urls).forEach(([name, url]) => {
      console.log(`   • ${name}: ${url}`);
    });

  } catch (error) {
    console.error('❌ Error generating QR codes:', error.message);
    process.exit(1);
  }
}

generateCampaignQRCodes();
