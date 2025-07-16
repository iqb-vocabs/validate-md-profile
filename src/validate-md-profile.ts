#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";

import {
    ProfileEntryParametersVocabulary,
    ProfileEntryParametersText,
    ProfileEntryParametersBoolean,
    ProfileEntryParametersNumber,
    MDProfile
} from "@iqbspecs/metadata-profile/metadata-profile.interface";

export const profileEntryTextFormatAsText: { [key: string]: string } = {
    "single": "Einzeilig",
    "multiline": "Mehrzeilig",
    "html": "Html/formatierter Text"
}

const mdTargetFolder = './docs';
let quartoMode = true;

let configFileName = './profile-config.json';
if (process.argv[2]) {
    if (process.argv[2] === '-md') {
        quartoMode = false;
    } else {
        configFileName = `./${process.argv[2]}`;
    }
}

if (process.argv[3] && process.argv[3] === '-md') {
    quartoMode = false;
}
const mdTargetFilename = `${mdTargetFolder}/README.${quartoMode ? 'qmd' : 'md'}`;

SchemaValidateFactory.validateConfig(configFileName)
    .then(async (mdConfig) => {
        if (mdConfig) {
            console.log(`config file '${configFileName}' is valid: ${mdConfig.id}`);
            let allProfiles: MDProfile[] = [];
            const fs = require('fs');

            await Promise.all(mdConfig.profiles
                .map(async profile => {
                    allProfiles.push(<MDProfile>await SchemaValidateFactory.validateProfile(profile));
                })
            );

            if (fs.existsSync(mdTargetFolder)) {
                let mdContent = '';
                mdContent += quartoMode ? `---\ntitle: ${mdConfig.title[0].value.replace(":", " -")}\n---\n\n` : `# ${mdConfig.title[0].value}\n\n`;
                mdContent += `ID of profile-store: \`${mdConfig.id}\`\n\n`;
                if (mdConfig.creator) mdContent += `Creator: ${mdConfig.creator}\n\n`;
                if (mdConfig.maintainer !== mdConfig.creator && mdConfig.maintainer !== "") mdContent += `Maintainer: ${mdConfig.maintainer}\n\n`;

                if (allProfiles.length > 0) {
                    mdContent += `${allProfiles.length} ${allProfiles.length === 1 ? 'Profil' : 'Profile'} definiert:\n\n`;
                    allProfiles.forEach(p => {
                        mdContent += quartoMode ? `# ${(p.label)[0].value}\n\n` : `## Profil "${(p.label)[0].value}"\n\n`;
                        mdContent += `ID of profile: \`${p.id}\`\n\n`;
                        p.groups.forEach(g => {
                            if (p.groups.length > 1) mdContent += quartoMode ? `## ${(g.label)[0].value}\n\n` : `### ${(g.label)[0].value}\n\n`;
                            mdContent += '| Name/Label | Typ | Parameter | ID Profil-Eintrag |\n';
                            mdContent += '| :--- | :---: | :--- | :---: |\n';
                            g.entries.forEach(e => {
                                mdContent += `| ${(e.label)[0].value} | `;
                                if (e.type === 'vocabulary' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersVocabulary;
                                    const levelText = p.maxLevel > 1 ? ', Zeige nur erste ' + p.maxLevel + ' Ebenen' : ', Zeige nur erste Ebene';
                                    mdContent += `[Vokabular](${p.url}) | url: '${p.url}', ${p.allowMultipleValues ? 'Mehrfachauswahl' : 'Einmalauswahl'}${p.maxLevel > 0 ? levelText : ''}${p.hideNumbering ? ', Nummerierung unterdrückt' : ''}${p.hideTitle ? ', Titel unterdrückt' : ''}${p.hideDescription ? ', Beschreibung unterdrückt' : ''}${p.addTextLanguages && p.addTextLanguages.length > 0 ? ', mit Texteingabe in Sprache(n): ' + p.addTextLanguages.join('/') : ''}`
                                } else if (e.type === 'text' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersText;
                                    mdContent += `Text | ${profileEntryTextFormatAsText[p.format]}, Sprache(n): de ${p.pattern ? ', Gültigkeitsmuster: ' + p.pattern : ''} `
                                } else if (e.type === 'number' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersNumber;
                                    mdContent += `Zahl | Kommastellen: ${p.digits}, Mindestwert: ${p.minValue === undefined ? 'kein' : p.minValue}, Maximalwert: ${p.maxValue === undefined ? 'kein' : p.maxValue}${p.isPeriodSeconds ? ', als Sekunden' : ''}`
                                } else if (e.type === 'boolean' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersBoolean;
                                    mdContent += `Ja/Nein | Text für WAHR: ${p.trueLabel[0].value}, Text für FALSCH: ${p.falseLabel[0].value}`
                                }
                                mdContent += ` | ${e.id} |\n`;
                            })
                            mdContent += quartoMode ? '\n: {tbl-colwidths="[15,15,55,15]"}\n\n' : '\n';
                        })
                    })
                } else {
                    mdContent += 'Keine Profile definiert.\n';
                    console.log('\x1b[0;33mWARNING\x1b[0m no profiles found');
                }
                fs.writeFileSync(mdTargetFilename, mdContent, {encoding: 'utf8'});
                console.log(`markdown file "${mdTargetFilename}" generated.`);
            } else {
                console.log(`\x1b[0;31mERROR\x1b[0m TargetFolder '${mdTargetFolder}' not found`);
                process.exitCode = 1;
            }
        } else {
            console.log(`\x1b[0;31mERROR\x1b[0m profile store '${configFileName}' not valid`);
            process.exitCode = 1;
        }
    });
