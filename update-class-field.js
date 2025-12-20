// Script to update "class" field for all character cards and remove from action cards
const fs = require('fs');
const path = require('path');

const cardDir = path.join(__dirname, 'Card');

// Character class mapping based on user's list
const characterClassMap = {
    // KARASUNO HIGH SCHOOL
    'sawamura-daichi': 12,
    'sugawara-koshi': 12,
    'azumane-asahi': 12,
    'tanaka-ryunosuke': 11,
    'nishinoya-yu': 11,
    'ennoshita-chikara': 11,
    'kinoshita-hisashi': 11,
    'narita-kazuhito': 11,
    'kageyama-tobio': 10,
    'hinata-shouyo': 10,
    'tsukishima-kei': 10,
    'yamaguchi-tadashi': 10,
    
    // AOBA JOHSAI (SEIJOH)
    'oikawa-toru': 12,
    'iwaizumi-hajime': 12,
    'matsukawa-issei': 12,
    'hanamaki-takahiro': 12,
    'kyotani-kentaro': 12,
    'kunimi-akira': 11,
    'yahaba-shigeru': 11,
    'watari-shinji': 11,
    'kindaichi-yutaro': 10,
    
    // NEKOMA HIGH SCHOOL
    'kuroo-tetsuro': 12,
    'yaku-morisuke': 11,
    'yamamoto-taketora': 11,
    'kozume-kenma': 11,
    'haiba-lev': 10,
    
    // SHIRATORIZAWA ACADEMY
    'ushijima-wakatoshi': 12,
    'tendo-satori': 12,
    'semi-eita': 12,
    'ohira-reon': 12,
    'shirabu-kenjiro': 11,
    'kawanishi-taichi': 11,
    'yamagata-hayato': 11,
    'goshiki-tsutomu': 10,
    
    // DATE TECH HIGH SCHOOL
    'futakuchi-kenji': 11,
    'aone-takanobu': 11,
    'obara-yutaka': 11,
    'koganegawa-kanji': 10,
    'sakunami-kosuke': 10,
    
    // FUKURODANI ACADEMY
    'sarukui-yamato': 12,
    'komi-haruki': 12,
    'bokuto-kotaro': 11,
    'akaashi-keiji': 11,
    
    // JOZENJI HIGH SCHOOL
    'terushima-yuji': 11,
    'bobata-kazuma': 11,
    
    // KAKUGAWA HIGH SCHOOL
    'hyakuzawa-yudai': 10,
    
    // WAKUTANI MINAMI HIGH SCHOOL
    'nakashima-takeru': 12,
    'kawatabi-shunki': 12,
};

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

function processCardFile(filePath, isActionCard) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (isActionCard) {
            // Remove class field from action cards
            if (jsonData.class !== undefined) {
                delete jsonData.class;
                fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4) + '\n', 'utf8');
                return { updated: true, action: 'removed', name: jsonData.name };
            }
            return { updated: false, reason: 'No class to remove' };
        } else {
            // Update class for character cards
            const cardId = path.basename(filePath, '.json');
            const cardClass = getClassFromName(cardId, jsonData.name);
            
            const wasUpdated = jsonData.class !== cardClass;
            jsonData.class = cardClass;
            
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4) + '\n', 'utf8');
            
            return { updated: wasUpdated, class: cardClass, name: jsonData.name };
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { updated: false, reason: error.message };
    }
}

function scanCardFolder(dir) {
    const results = {
        updated: [],
        removed: [],
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
        
        // Process character cards
        const characterPath = path.join(schoolPath, 'Nhan vat');
        if (fs.existsSync(characterPath)) {
            const files = fs.readdirSync(characterPath)
                .filter(file => file.endsWith('.json'));
            
            files.forEach(file => {
                const filePath = path.join(characterPath, file);
                const result = processCardFile(filePath, false);
                
                if (result.updated) {
                    results.updated.push({
                        file: file,
                        class: result.class,
                        name: result.name
                    });
                } else if (result.reason) {
                    results.errors.push({ file: file, reason: result.reason });
                }
            });
        }
        
        // Process action cards
        const actionPath = path.join(schoolPath, 'Hanh dong');
        if (fs.existsSync(actionPath)) {
            const files = fs.readdirSync(actionPath)
                .filter(file => file.endsWith('.json'));
            
            files.forEach(file => {
                const filePath = path.join(actionPath, file);
                const result = processCardFile(filePath, true);
                
                if (result.updated && result.action === 'removed') {
                    results.removed.push({
                        file: file,
                        name: result.name
                    });
                } else if (result.reason) {
                    results.errors.push({ file: file, reason: result.reason });
                }
            });
        }
    });
    
    return results;
}

// Run the script
console.log('🔍 Updating class field for character cards and removing from action cards...\n');
const results = scanCardFolder(cardDir);

console.log(`✅ Updated character cards: ${results.updated.length} files`);
results.updated.forEach(item => {
    const classText = item.class ? `Lớp ${item.class}` : 'null';
    console.log(`   - ${item.file}: ${item.name} → ${classText}`);
});

console.log(`\n🗑️  Removed class from action cards: ${results.removed.length} files`);
if (results.removed.length > 0 && results.removed.length <= 20) {
    results.removed.forEach(item => console.log(`   - ${item.file}: ${item.name}`));
} else if (results.removed.length > 20) {
    console.log(`   (Showing first 20 of ${results.removed.length})`);
    results.removed.slice(0, 20).forEach(item => console.log(`   - ${item.file}: ${item.name}`));
}

console.log(`\n❌ Errors: ${results.errors.length} files`);
if (results.errors.length > 0) {
    results.errors.forEach(item => console.log(`   - ${item.file}: ${item.reason}`));
}

console.log(`\n✅ Done!`);

