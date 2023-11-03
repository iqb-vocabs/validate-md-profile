#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";
import {MDProfile, ProfileEntryParametersVocabulary, profileEntryTypeAsText} from "@iqb/metadata";

const mdTargetFolder = './docs';
const mdTargetFilename = `${mdTargetFolder}/README.md`;

let configFileName = './profile-config.json';
if (process.argv[2]) {
    configFileName = `./${process.argv[2]}`;
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
                    if (p.groups.length > 1) mdContent += `### ${g.label}\n\n`;
                    mdContent += '| Name/Label | Typ | Parameter | ID Profil-Eintrag |\n';
                    mdContent += '| :--- | :---: | :--- | :---: |\n';
                    g.entries.forEach(e => {
                        mdContent += `| ${e.label} | `;
                        if (e.type === 'vocabulary' && e.parameters) {
                            const p = e.parameters as ProfileEntryParametersVocabulary;
                            mdContent += `[${profileEntryTypeAsText[e.type]}](${p.url}) | `
                        } else {
                            mdContent += `${profileEntryTypeAsText[e.type] || '?'} |`
                        }
                        mdContent += e.getParametersAsText();
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
