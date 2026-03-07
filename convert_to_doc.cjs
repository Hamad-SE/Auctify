const fs = require('fs');

const mdPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\ca740cdd-e172-43e3-9bba-726244b44cc9\\auctify_requirements.md';
const docPath = 'auctify_requirements.doc';

const mdContent = fs.readFileSync(mdPath, 'utf8');

// Basic regex-based markdown to HTML for this specific file structure
let html = mdContent
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul>/gim, '')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>');

const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Auctify Requirements</title></head>
<body>
${html}
</body>
</html>
`;

fs.writeFileSync(docPath, wordHtml);
console.log('Successfully created', docPath);
