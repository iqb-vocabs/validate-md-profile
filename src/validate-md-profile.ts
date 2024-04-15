#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";
import {MDProfile, ProfileEntryParametersVocabulary, profileEntryTypeAsText} from "@iqb/metadata";

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
        } else {
            console.log(`\x1b[0;33mWARNING\x1b[0m profile '${p}' not valid - ignore`);
        }
    });
    const fs = require('fs');
    if (fs.existsSync(mdTargetFolder)) {
        let mdContent = '';
        mdContent += quartoMode ? `---\ntitle: ${mdConfig.title.replace(":"," -")}\n---\n\n` : `# ${mdConfig.title}\n\n`;
        mdContent += `ID of profile-store: \`${mdConfig.id}\`\n\n`;
        if (mdConfig.publisher) mdContent += `Publisher: ${mdConfig.publisher}\n\n`;
        if (mdConfig.maintainer !== "") mdContent += `Maintainer: ${mdConfig.maintainer}\n\n`;
        if (allProfiles.length > 0) {
            mdContent += `${allProfiles.length} ${allProfiles.length === 1 ? 'Profil' : 'Profile'} definiert:\n\n`;
            allProfiles.forEach(p => {
                mdContent += quartoMode ? `# ${p.label}\n\n` : `## Profil "${p.label}"\n\n`;
                mdContent += `ID of profile: \`${p.id}\`\n\n`;
                p.groups.forEach(g => {
                    if (p.groups.length > 1) mdContent += quartoMode ? `## ${g.label}\n\n` : `### ${g.label}\n\n`;
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
