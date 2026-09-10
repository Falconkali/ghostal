const fs = require('fs');
const file = 'c:/Users/dell/OneDrive/Desktop/happy/src/app/(dashboard)/analytics/page.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/join\("\\n"\)/g, 'JOIN_NEWLINE_PLACEHOLDER');
content = content.replace(/\\n/g, '\n');
content = content.replace(/JOIN_NEWLINE_PLACEHOLDER/g, 'join("\\n")');
fs.writeFileSync(file, content, 'utf-8');
