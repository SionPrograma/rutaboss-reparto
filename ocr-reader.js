// ocr-reader.js
// Lógica gratuita de lectura de etiquetas usando Tesseract.js

async function readLabelWithOCR(imageFile, progressCallback) {
    if (typeof Tesseract === 'undefined') {
        console.error("Tesseract.js no está cargado");
        return null;
    }
    try {
        const { data: { text } } = await Tesseract.recognize(imageFile, 'spa+eng', {
            logger: m => {
                if (m.status === 'recognizing text' && progressCallback) {
                    progressCallback(m.progress);
                }
            }
        });
        return { text, parsed: parseCorreosExpressLabelText(text) };
    } catch (e) {
        console.error("Error OCR:", e);
        return null;
    }
}

function normalizeOCRText(text) {
    return text.toUpperCase().replace(/\s+/g, ' ').trim();
}

function parseCorreosExpressLabelText(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const normalizedLines = lines.map(normalizeOCRText);
    const fullNorm = normalizeOCRText(rawText);
    
    let telefono = '';
    let cliente = '';
    let direccion = '';
    let pisoPuerta = '';
    let codigoPostal = '';
    let ciudad = '';
    let posibleCobro = false;
    let importeCobro = 0;
    let idPaquete = '';
    
    // Teléfono
    const telMatch = rawText.match(/(?:TELF|TEL|TELEFONO|MÓVIL)?\s*[:.-]?\s*([6789]\d{8}|\d{3}\s\d{3}\s\d{3})/i);
    if (telMatch) {
        telefono = telMatch[1].replace(/\s/g, '');
    }
    
    // CP
    const cpMatch = rawText.match(/\b(29\d{3})\b/);
    if (cpMatch) {
        codigoPostal = cpMatch[1];
        ciudad = "MÁLAGA";
    }
    
    // Dirección simple y cliente
    for (let i = 0; i < normalizedLines.length; i++) {
        let line = normalizedLines[i];
        if (line.match(/\b(C\/|CALLE|AV|AV\.|AVENIDA|PLAZA|CAMINO|PASAJE|LOCAL|POLIGONO|POLÍGONO)\b/)) {
            direccion = lines[i];
            // Cliente suele estar justo encima de la dirección
            if (i > 0 && !cliente) {
                cliente = lines[i-1];
            }
            break;
        }
    }
    
    // Piso/Puerta
    const pisoMatch = fullNorm.match(/(?:PISO|PTA|PUERTA|PTA\.)\s*([0-9A-Zº-]+)/);
    if (pisoMatch) {
        pisoPuerta = pisoMatch[0];
    }

    // Cobro
    if (fullNorm.includes('REEMBOLSO')) {
        const reemMatch = fullNorm.match(/REEMBOLSO\s*([0-9.,]+)/);
        if (reemMatch) {
            let val = parseFloat(reemMatch[1].replace(',', '.'));
            if (val > 0) {
                posibleCobro = true;
                importeCobro = val;
            }
        }
    }

    // ID Paquete
    const expMatch = fullNorm.match(/(?:EXP|REF|COD BULTO)\s*[:.-]?\s*([A-Z0-9]{5,20})/);
    if (expMatch) {
        idPaquete = expMatch[1];
    } else {
        const longNum = fullNorm.match(/\b\d{12,}\b/);
        if (longNum) idPaquete = longNum[0];
    }
    
    return {
        cliente,
        telefono,
        direccion,
        pisoPuerta,
        codigoPostal,
        ciudad,
        posibleCobro,
        importeCobro,
        idPaquete
    };
}
