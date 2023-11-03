#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";
import {
    MDProfile,
    MDProfileEntry,
    ProfileEntryParametersBoolean,
    ProfileEntryParametersNumber,
    ProfileEntryParametersText, ProfileEntryParametersVocabulary
} from "@iqb/metadata";

const mdTargetFolder = './docs';
const mdTargetFilename = `${mdTargetFolder}/README.md`;

let configFileName = './profile-config.json';
if (process.argv[2]) {
    configFileName = `./${process.argv[2]}`;
}
const translateProfileEntryType: { [key: string]: string } = {
    "number": "Zahl",
    "boolean": "Ja/Nein",
    "vocabulary": "Vokabular",
    "text": "Text"
}
const profileEntryTextFormatAsText: { [key: string]: string } = {
    "single": "Einzeilig",
    "multiline": "Mehrzeilig",
    "html": "Html/formatierter Text"
}

function getProfileEntryParametersAsText( e: MDProfileEntry ): string {
    let returnText = '';
    if (e && e.parameters && e.type) {
        if (e.type === 'number') {
            const p = new ProfileEntryParametersNumber(e.parameters);
            returnText = `Kommastellen: ${p.digits}, Mindestwert: ${p.minValue === null ? 'kein' : p.minValue}, Maximalwert: ${p.maxValue === null ? 'kein' : p.maxValue}${p.isPeriodSeconds ? ', als Sekunden' : ''}`
        } else if (e.type === 'text') {
            const p = new ProfileEntryParametersText(e.parameters);
            returnText = `${profileEntryTextFormatAsText[p.format]}, Sprache(n): ${p.textLanguages.join('/')}${p.pattern ? ', Gültigkeitsmuster: ' + p.pattern : ''}`
        } else if (e.type === 'boolean') {
            const p = new ProfileEntryParametersBoolean(e.parameters);
            returnText = `Text für WAHR: ${p.trueLabel}, Text für FALSCH: ${p.falseLabel}`
        } else if (e.type === 'vocabulary') {
            const p = new ProfileEntryParametersVocabulary(e.parameters);
            returnText = `url: '${p.url}', ${p.allowMultipleValues ? 'Mehrfachauswahl' : 'Einmalauswahl'}${p.maxLevel > 0 ? ', Zeige nur erste ' + p.maxLevel + 'Ebene(n)': ''}${p.hideNumbering ? ', verberge Nummerierung' : ''}${p.hideTitle ? ', verberge Titel' : ''}${p.hideDescription ? ', verberge Beschreibung' : ''}${p.addTextLanguages && p.addTextLanguages.length > 0 ? ', mit Texteingabe in Sprache(n): ' + p.addTextLanguages.join('/') : ''}`
        }
    }
    return returnText;
}

const mdConfig = SchemaValidateFactory.validateConfig(configFileName);
if (mdConfig) {
    console.log(`config file '${configFileName}' is valid: ${mdConfig.title}`);
    let allProfiles: MDProfile[] = [];
    mdConfig.profiles.forEach(p => {
        const myMDProfile = SchemaValidateFactory.validateProfile(p);
        if (myMDProfile) {
            let entryCount = 0;
            myMDProfile.groups.forEach(g=> {
                entryCount += g.entries.length;
            });
            console.log(`${myMDProfile.groups.length} ${myMDProfile.groups.length === 1 ? 'group' : 'groups'} and ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} found in '${p}'.`);
            allProfiles.push(myMDProfile);
        }
    });
    const fs = require('fs');
    if (fs.existsSync(mdTargetFolder)) {
        let mdContent = `# ${mdConfig.title}\n`;
        mdContent += `\`\`\`\n${mdConfig.id}\n\`\`\`\n\n`;
        if (mdConfig.creator) mdContent += `Autor/Organisation: ${mdConfig.creator}\n\n`;
        if (allProfiles.length > 0) {
            mdContent += `${allProfiles.length} ${allProfiles.length === 1 ? 'Profil' : 'Profile'} definiert:\n\n`;
            allProfiles.forEach(p => {
                mdContent += `## Profil "${p.label}"\n`;
                mdContent += `\`\`\`\n${p.id}\n\`\`\`\n\n`;
                p.groups.forEach(g => {
                    if (p.groups.length > 1) mdContent += `### Gruppe "${g.label}"\n\n`;
                    mdContent += '| Name/Label | Typ | Parameter | ID Profil-Eintrag |\n';
                    mdContent += '| :--- | :---: | :--- | :---: |\n';
                    g.entries.forEach(e => {
                        mdContent += `| ${e.label} | ${translateProfileEntryType[e.type] || '?'} | `;
                        mdContent += getProfileEntryParametersAsText(e);
                        mdContent += ` | ${e.id} |\n`;
                    })
                })
            })
        } else {
            mdContent += 'Keine Profile definiert.\n';
        }
        fs.writeFileSync(mdTargetFilename, mdContent, {encoding: 'utf8'});
        console.log(`markdown file "${mdTargetFilename}" generated.`);
    }
}
