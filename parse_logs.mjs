import fs from 'fs';

const logPath = 'c:/Users/USER/.gemini/antigravity/brain/8979a21a-7e9c-49fa-a96a-54208672388d/.system_generated/steps/824/output.txt';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const json = JSON.parse(content);

    if (json.result && Array.isArray(json.result)) {
        const errors = json.result.filter(log => log.error_severity === 'ERROR' || log.error_severity === 'FATAL');
        console.log(`Found ${errors.length} errors.`);
        errors.forEach(err => {
            console.log('--- ERROR ---');
            console.log(`Time: ${new Date(err.timestamp / 1000).toISOString()}`);
            console.log(`Message: ${err.event_message}`);
            console.log(JSON.stringify(err, null, 2));
        });
    } else {
        console.log('Invalid log format');
    }
} catch (e) {
    console.error('Error parsing logs:', e);
}
