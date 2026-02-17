const https = require('https');

const payload = {
    text: "En el Reino de Starklandia, la única fuente del derecho es el lanzamiento de un dado de 20 caras por parte del Gran Maestre.",
    title: "Leyes de Starklandia",
    metadata: { source: "rag_verification" }
};
const data = JSON.stringify(payload);
const body = Buffer.from(data, 'utf8');

const options = {
    hostname: 'lkdfesfidxkaolcetseq.supabase.co',
    port: 443,
    path: '/functions/v1/process-pdf',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length
    }
};

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (d) => responseBody += d);
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${responseBody}`);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(body);
req.end();
