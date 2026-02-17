const https = require('https');

const payload = {
    query: "¿Cuál es la fuente del derecho en Starklandia?",
    lang: "es"
};
const data = JSON.stringify(payload);
const body = Buffer.from(data, 'utf8');

const options = {
    hostname: 'lkdfesfidxkaolcetseq.supabase.co',
    port: 443,
    path: '/functions/v1/chat',
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
