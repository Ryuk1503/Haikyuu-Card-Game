// Script to add "class" field to all card JSON files
const fs = require('fs');
const path = require('path');

const cardDir = path.join(__dirname, 'Card');

// Character class mapping (based on Haikyuu knowledge)
// This is a basic mapping - you may need to adjust based on actual card images
const characterClassMap = {
    // Karasuno - First years (Lớp 10)
    'hinata-shouyo': 10,
    'kageyama-tobio': 10,
    'tsukishima-kei': 10,
    'yamaguchi-tadashi': 10,
    
    // Karasuno - Second years (Lớp 11)
    'tanaka-ryunosuke': 11,
    'nishinoya-yu': 11,
    'azumane-asahi': 11,
    
    // Karasuno - Third years (Lớp 12)
    'sawamura-daichi': 12,
    'sugawara-koshi': 12,
    
    // Aobajosai - Third years (Lớp 12)
    'oikawa-toru': 12,
    'iwaizumi-hajime': 12,
    'matsukawa-issei': 12,
    'hanamaki-takahiro': 12,
    'kindaichi-yutaro': 12,
    'kunimi-akira': 12,
    
    // Aobajosai - Second years (Lớp 11)
    'watari-shinji': 11,
    'yahaba-shigeru': 11,
    'kyotani-kentaro': 11,
    
    // Shiratorizawa - Third years (Lớp 12)
    'ushijima-wakatoshi': 12,
    'tendo-satori': 12,
    'semi-eita': 12,
    'ohira-reon': 12,
    'yamagata-hayato': 12,
    
    // Shiratorizawa - Second years (Lớp 11)
    'goshiki-tsutomu': 11,
    'shirabu-kenjiro': 11,
    'kawanishi-taichi': 11,
};

// Try to extract class from skill description
function extractClassFromSkill(skillDescription) {
    if (!skillDescription) return null;
    
    // Look for "Lớp 12", "Lớp 11", "Lớp 10", "Lớp 9"
    const classMatch = skillDescription.match(/Lớp\s+(\d+)/i);
    if (classMatch) {
        return parseInt(classMatch[1]);
    }
    
    // Look for "lớp 12", "lớp 11", etc.
    const classMatch2 = skillDescription.match(/lớp\s+(\d+)/i);
    if (classMatch2) {
        return parseInt(classMatch2[1]);
    }
    
    return null;
}

// Get class from character name (base name without number)
function getClassFromName(cardId, name) {
    // Extract base name (remove numbers and dashes)
    const baseName = cardId.split('-').slice(0, -1).join('-');
    
    // Check mapping
    if (characterClassMap[baseName]) {
        return characterClassMap[baseName];
    }
    
    return null;
}

function processCardFile(filePath) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Try to determine class
        let cardClass = jsonData.class || null;
        
        // 1. Try from skill description (override if found)
        if (jsonData.skill?.description) {
            const skillClass = extractClassFromSkill(jsonData.skill.description);
            if (skillClass) cardClass = skillClass;
        }
        
        // 2. Try from character name mapping (only if class is null)
        if (!cardClass && jsonData.name) {
            const cardId = path.basename(filePath, '.json');
            cardClass = getClassFromName(cardId, jsonData.name);
        }
        
        // Update class field (null if cannot determine)
        const wasUpdated = jsonData.class !== cardClass;
        jsonData.class = cardClass;
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4) + '\n', 'utf8');
        
        return { updated: wasUpdated, class: cardClass, name: jsonData.name };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { updated: false, reason: error.message };
    }
}

function scanCardFolder(dir) {
    const results = {
        updated: [],
        skipped: [],
        errors: []
    };
    
    if (!fs.existsSync(dir)) {
        console.error('Card directory not found:', dir);
        return results;
    }
    
    const schools = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    schools.forEach(school => {
        const schoolPath = path.join(dir, school);
        const typeFolders = ['Nhan vat', 'Hanh dong'];
        
        typeFolders.forEach(typeFolder => {
            const typePath = path.join(schoolPath, typeFolder);
            
            if (!fs.existsSync(typePath)) return;
            
            const files = fs.readdirSync(typePath)
                .filter(file => file.endsWith('.json'));
            
            files.forEach(file => {
                const filePath = path.join(typePath, file);
                const result = processCardFile(filePath);
                
                if (result.updated) {
                    results.updated.push({
                        file: file,
                        class: result.class,
                        name: result.name
                    });
                } else if (result.reason === 'Class already exists') {
                    results.skipped.push(file);
                } else {
                    results.errors.push({ file: file, reason: result.reason });
                }
            });
        });
    });
    
    return results;
}

// Run the script
console.log('🔍 Scanning Card folder and adding "class" field...\n');
const results = scanCardFolder(cardDir);

console.log(`✅ Updated: ${results.updated.length} files`);
results.updated.forEach(item => {
    const classText = item.class ? `Lớp ${item.class}` : 'null';
    console.log(`   - ${item.file}: ${item.name} → ${classText}`);
});

console.log(`\n⏭️  Skipped (already has class): ${results.skipped.length} files`);
if (results.skipped.length > 0 && results.skipped.length <= 10) {
    results.skipped.forEach(file => console.log(`   - ${file}`));
}

console.log(`\n❌ Errors: ${results.errors.length} files`);
if (results.errors.length > 0) {
    results.errors.forEach(item => console.log(`   - ${item.file}: ${item.reason}`));
}

console.log(`\n📝 Note: Files with class = null need to be filled manually based on PNG images.`);

