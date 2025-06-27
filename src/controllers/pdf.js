import crypto from 'crypto';
import { minioClient } from '../config/minio.js';
import Outbox from '../models/outbox.js';
import moment from 'moment-hijri';
import * as html_to_pdf from 'html-pdf-node';

const BUCKET_NAME = process.env.MINIO_BUCKET;
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL;

const formatHijri = (date) => {
  if (!date) return '-';
  const m = moment(date);
  const bulan = [
    'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir',
    'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawwal', 'Dzulkaidah', 'Dzulhijjah'
  ];
  return `${m.iDate()} ${bulan[m.iMonth()]} ${m.iYear()} H`;
};

export const createOutboxPDF = async (req, res) => {
  try {
    const {
      number,
      category,
      date,
      destination,
      content,
      summary,
      sign,
      orgName,
      orgNumber,
      orgAddress,
      orgEmail,
      orgLogoUrl,
    } = req.body;

    const exist = await Outbox.findOne({ number });
    if (exist) return res.status(400).json({ message: 'Nomor surat sudah ada' });

    // Upload attachments
    let attachmentUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const ext = file.originalname.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        await minioClient.putObject(BUCKET_NAME, fileName, file.buffer, file.size, file.mimetype);
        const fileUrl = `${PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
        attachmentUrls.push(fileUrl);
      }
    }

    // Create Outbox entry first (pdfUrl is null for now)
    const outbox = new Outbox({
      number,
      category,
      date,
      destination,
      summary,
      content,
      sign,
      attachment: attachmentUrls.length,
      attachmentUrls,
      createdBy: req.user.name,
    });
    await outbox.save();

    // Generate PDF
    const hijri = formatHijri(date);
    const masehi = new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Surat Keluar</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14pt;
      margin: 40px;
      line-height: 1.5;
      color: #000;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
    }

    .logo {
      width: 100px;
      height: auto;
    }

    .kop {
      text-align: center;
      flex: 1;
    }

    .kop h2, .kop h3 {
      margin: 0;
    }

    .kop h2 {
      font-size: 20pt;
      font-weight: bold;
    }

    .kop h3 {
      font-size: 18pt;
    }

    .kop p {
      margin: 0;
      font-size: 12pt;
    }

    .alamat {
      font-style: italic;
    }

    .double-line {
      border: none;
      border-top: 3px double black;
      margin: 10px 0 20px;
    }

    .info-surat table {
      width: 100%;
      margin-bottom: 20px;
      font-size: 13pt;
    }

    .tujuan p {
      margin: 0;
    }

    .isi p {
      margin-bottom: 15px;
      text-align: justify;
    }

    .ttd {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      font-size: 13pt;
    }

    .ttd .left,
    .ttd .right {
      width: 45%;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="container">
    <header>
      <img src="${orgLogoUrl}" alt="Logo Organisasi" class="logo">
      <div class="kop">
        <h2>${orgName || "PIMPINAN CABANG ‘AISYIYAH"}</h2>
        <h3>MOJOTENGAH</h3>
        <p>DAERAH KABUPATEN WONOSOBO</p>
        <p class="alamat">Alamat: ${orgAddress}</p>
        <p class="alamat">Telp: ${orgNumber} | Email: ${orgEmail}</p>
      </div>
    </header>
    <hr class="double-line">

    <section class="info-surat">
      <table>
        <tr>
          <td>Nomor</td>
          <td>: ${number}</td>
          <td style="text-align: right;">Mojotengah, ${hijri}</td>
        </tr>
        <tr>
          <td>Lamp</td>
          <td>: ${attachmentUrls.length > 0 ? attachmentUrls.length + ' berkas' : '-'}</td>
          <td style="text-align: right;">${masehi}</td>
        </tr>
        <tr>
          <td>Hal</td>
          <td colspan="2">: <strong>${category}</strong></td>
        </tr>
      </table>
    </section>

    <section class="tujuan">
      <p>Kepada Yth:</p>
      <p>${destination}</p>
    </section>

    <section class="isi">
      ${content}
    </section>

    <section class="ttd">
      <div class="left">
        <p><strong>Ketua,</strong></p>
        <br><br>
        <p><strong>${sign || 'Nama Ketua'}</strong></p>
      </div>
      <div class="right">
        <p><strong>Sekretaris,</strong></p>
        <br><br>
        <p><strong>Masitoh</strong></p>
      </div>
    </section>
  </div>
</body>
</html>`;

    const file = { content: html };
    const pdfBuffer = await html_to_pdf.generatePdf(file, {
      format: 'A4',
      printBackground: true
    });

    // Upload PDF to MinIO
    const pdfName = `surat-${number}-${Date.now()}.pdf`;
    await minioClient.putObject(
      BUCKET_NAME,
      pdfName,
      pdfBuffer,
      pdfBuffer.length,
      { "Content-Type": "application/pdf" }
    );
    const pdfUrl = `${PUBLIC_URL}/${BUCKET_NAME}/${pdfName}`;

    // Update Outbox with PDF URL
    outbox.pdfUrl = pdfUrl;
    await outbox.save();

    res.status(201).json({ message: 'ok', outbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', err });
  }
};

export const updateOutboxPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      number,
      category,
      date,
      destination,
      content,
      summary,
      sign,
      orgName,
      orgNumber,
      orgAddress,
      orgEmail,
      orgLogoUrl,
    } = req.body;

    const outbox = await Outbox.findById(id);
    if (!outbox) return res.status(404).json({ message: 'Surat tidak ditemukan' });

    // Check if number is being changed and already exists elsewhere
    if (number !== outbox.number) {
      const duplicate = await Outbox.findOne({ number });
      if (duplicate) return res.status(400).json({ message: 'Nomor surat sudah ada' });
    }

    // Upload new attachments if provided
    let attachmentUrls = outbox.attachmentUrls;
    if (req.files && req.files.length > 0) {
      attachmentUrls = [];
      for (const file of req.files) {
        const ext = file.originalname.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;
        await minioClient.putObject(BUCKET_NAME, fileName, file.buffer, file.size, file.mimetype);
        const fileUrl = `${PUBLIC_URL}/${BUCKET_NAME}/${fileName}`;
        attachmentUrls.push(fileUrl);
      }
    }

    const hijri = formatHijri(date);
    const masehi = new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Surat Keluar</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14pt;
      margin: 40px;
      line-height: 1.5;
      color: #000;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
    }

    .logo {
      width: 100px;
      height: auto;
    }

    .kop {
      text-align: center;
      flex: 1;
    }

    .kop h2, .kop h3 {
      margin: 0;
    }

    .kop h2 {
      font-size: 20pt;
      font-weight: bold;
    }

    .kop h3 {
      font-size: 18pt;
    }

    .kop p {
      margin: 0;
      font-size: 12pt;
    }

    .alamat {
      font-style: italic;
    }

    .double-line {
      border: none;
      border-top: 3px double black;
      margin: 10px 0 20px;
    }

    .info-surat table {
      width: 100%;
      margin-bottom: 20px;
      font-size: 13pt;
    }

    .tujuan p {
      margin: 0;
    }

    .isi p {
      margin-bottom: 15px;
      text-align: justify;
    }

    .ttd {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      font-size: 13pt;
    }

    .ttd .left,
    .ttd .right {
      width: 45%;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="container">
    <header>
      <img src="${orgLogoUrl}" alt="Logo Organisasi" class="logo">
      <div class="kop">
        <h2>${orgName || "PIMPINAN CABANG ‘AISYIYAH"}</h2>
        <h3>MOJOTENGAH</h3>
        <p>DAERAH KABUPATEN WONOSOBO</p>
        <p class="alamat">Alamat: ${orgAddress}</p>
        <p class="alamat">Telp: ${orgNumber} | Email: ${orgEmail}</p>
      </div>
    </header>
    <hr class="double-line">

    <section class="info-surat">
      <table>
        <tr>
          <td>Nomor</td>
          <td>: ${number}</td>
          <td style="text-align: right;">Mojotengah, ${hijri}</td>
        </tr>
        <tr>
          <td>Lamp</td>
          <td>: ${attachmentUrls.length > 0 ? attachmentUrls.length + ' berkas' : '-'}</td>
          <td style="text-align: right;">${masehi}</td>
        </tr>
        <tr>
          <td>Hal</td>
          <td colspan="2">: <strong>${category}</strong></td>
        </tr>
      </table>
    </section>

    <section class="tujuan">
      <p>Kepada Yth:</p>
      <p>${destination}</p>
    </section>

    <section class="isi">
      ${content}
    </section>

    <section class="ttd">
      <div class="left">
        <p><strong>Ketua,</strong></p>
        <br><br>
        <p><strong>${sign || 'Nama Ketua'}</strong></p>
      </div>
      <div class="right">
        <p><strong>Sekretaris,</strong></p>
        <br><br>
        <p><strong>Masitoh</strong></p>
      </div>
    </section>
  </div>
</body>
</html>`;

    const file = { content: html };
    const pdfBuffer = await html_to_pdf.generatePdf(file, {
      format: 'A4',
      printBackground: true
    });

    const pdfName = `surat-${number}-${Date.now()}.pdf`;
    await minioClient.putObject(
      BUCKET_NAME,
      pdfName,
      pdfBuffer,
      pdfBuffer.length,
      { "Content-Type": "application/pdf" }
    );
    const pdfUrl = `${PUBLIC_URL}/${BUCKET_NAME}/${pdfName}`;

    // Update outbox fields
    outbox.number = number;
    outbox.category = category;
    outbox.date = date;
    outbox.destination = destination;
    outbox.summary = summary;
    outbox.content = content;
    outbox.sign = sign;
    outbox.attachment = attachmentUrls.length;
    outbox.attachmentUrls = attachmentUrls;
    outbox.pdfUrl = pdfUrl;

    await outbox.save();

    res.status(200).json({ message: 'Outbox updated successfully', outbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', err });
  }
};

