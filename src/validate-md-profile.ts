#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";
// import {MDProfile, ProfileEntryParametersVocabulary, profileEntryTypeAsText} from "@iqb/metadata";
import {
    MDProfileEntry,
    ProfileEntryParametersVocabulary,
    ProfileEntryParametersText,
    LanguageCodedText, ProfileEntryParametersBoolean, ProfileEntryParametersNumber
} from "@iqbspecs/metadata-profile/metadata-profile.interface";

export interface MDProfileGroup {
    label: LanguageCodedText[],
    entries: MDProfileEntry[];
}

export interface MDProfile {
    id: string,
    label: LanguageCodedText[],
    groups: MDProfileGroup[];
}


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

// @ts-ignore
async function loadAllProfiles(mdConfig) {
    const allProfiles: MDProfile[] = [];



    return allProfiles;
}

const mdTargetFilename = `${mdTargetFolder}/README.${quartoMode ? 'qmd' : 'md'}`;
console.log()
// const mdConfig = SchemaValidateFactory.validateConfig(configFileName);
SchemaValidateFactory.validateConfig(configFileName)
    .then(async (mdConfig) => {
        // @ts-ignore
        console.log(`config file '${configFileName}' is valid: ${mdConfig.id}`);
        let allProfiles: MDProfile[] = [];
        const fs = require('fs');

        // @ts-ignore
        // mdConfig.profiles.forEach(async p => {
        //const profiles: MDProfile[] = mdConfig.profiles.map(p=> {
            // const myMDProfile = SchemaValidateFactory.validateProfile(p);
            // @ts-ignore
        //     <MDProfile>await SchemaValidateFactory.validateProfile(p).then(myMDProfile => {
        //         // if (myMDProfile) {
        //         let entryCount = 0;
        //         // @ts-ignore
        //         myMDProfile.groups.forEach(g => {
        //             entryCount += g.entries.length;
        //         });
        //         // @ts-ignore
        //         console.log(`${myMDProfile.groups.length} ${myMDProfile.groups.length === 1 ? 'group' : 'groups'} and ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} found in '${p}'.`);
        //         if (null !== myMDProfile) {
        //             let prof: MDProfile = {
        //                 id: myMDProfile.id,
        //                 label: myMDProfile.label,
        //                 groups: myMDProfile.groups
        //             };
        //             console.log(myMDProfile);
        //             allProfiles.push(prof);
        //         }
        //         return myMDProfile;
        //     }).catch(error => {
        //         console.log(`\x1b[0;33mWARNING\x1b[0m profile '${p}' not valid - ignore`);
        //     });
        // });
        // @ts-ignore
        await Promise.all(mdConfig.profiles
            .map(async profile => {
                // @ts-ignore
                allProfiles.push(<MDProfile>await SchemaValidateFactory.validateProfile(profile));

                })
            );
        console.log(`La longitud es ${allProfiles.length}`);
        console.log(allProfiles[0].groups[0].entries[0].label);
        console.log(allProfiles[1]);


        if (fs.existsSync(mdTargetFolder)) {
                let mdContent = '';
                // @ts-ignore
                mdContent += quartoMode ? `---\ntitle: ${mdConfig.title[0].value.replace(":", " -")}\n---\n\n` : `# ${mdConfig.title[0].value}\n\n`;
                // @ts-ignore
                mdContent += `ID of profile-store: \`${mdConfig.id}\`\n\n`;
                // @ts-ignore
                if (mdConfig.publisher) mdContent += `Publisher: ${mdConfig.publisher}\n\n`;
                // @ts-ignore
                if (mdConfig.maintainer !== "") mdContent += `Maintainer: ${mdConfig.maintainer}\n\n`;
                console.log("paso 1");
                if (allProfiles.length > 0) {
                    console.log("paso 2");
                    mdContent += `${allProfiles.length} ${allProfiles.length === 1 ? 'Profil' : 'Profile'} definiert:\n\n`;
                    console.log(mdContent);
                    allProfiles.forEach(p => {
                        mdContent += quartoMode ? `# ${p.label}\n\n` : `## Profil "${(p.label)[0].value}"\n\n`;
                        mdContent += `ID of profile: \`${p.id}\`\n\n`;
                        console.log(mdContent);
                        p.groups.forEach(g => {
                            if (p.groups.length > 1) mdContent += quartoMode ? `## ${(g.label)[0].value}\n\n` : `### ${(g.label)[0].value}\n\n`;
                            mdContent += '| Name/Label | Typ | Parameter | ID Profil-Eintrag |\n';
                            mdContent += '| :--- | :---: | :--- | :---: |\n';
                            console.log(mdContent);
                            g.entries.forEach(e => {
                                mdContent += `| ${(e.label)[0].value} | `;
                                console.log('paso3');
                                console.log(mdContent);
                                if (e.type === 'vocabulary' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersVocabulary;
                                    const levelText = p.maxLevel > 1 ? ', Zeige nur erste ' + p.maxLevel + ' Ebenen' : ', Zeige nur erste Ebene';
                                    mdContent += `[Vokabular](${p.url}) | url: '${p.url}', ${p.allowMultipleValues ? 'Mehrfachauswahl' : 'Einmalauswahl'}${p.maxLevel > 0 ? levelText : ''}${p.hideNumbering ? ', Nummerierung unterdrückt' : ''}${p.hideTitle ? ', Titel unterdrückt' : ''}${p.hideDescription ? ', Beschreibung unterdrückt' : ''}${p.addTextLanguages && p.addTextLanguages.length > 0 ? ', mit Texteingabe in Sprache(n): ' + p.addTextLanguages.join('/') : ''}`
                                    console.log('paso4');
                                    console.log(mdContent);
                                } else if (e.type === 'text' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersText;
                                    mdContent += `Text | ${profileEntryTextFormatAsText[p.format]}, Sprache(n): de ${p.pattern ? ', Gültigkeitsmuster: ' + p.pattern : ''} `
                                    console.log('paso4');
                                    console.log(mdContent);
                                } else if (e.type === 'numbers' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersNumber;
                                    mdContent += `Zahl | Kommastellen: ${p.digits}, Mindestwert: ${p.minValue === null ? 'kein' : p.minValue}, Maximalwert: ${p.maxValue === null ? 'kein' : p.maxValue}${p.isPeriodSeconds ? ', als Sekunden' : ''}`
                                    console.log('paso4');
                                    console.log(mdContent);
                                } else if (e.type === 'boolean' && e.parameters) {
                                    const p = e.parameters as ProfileEntryParametersBoolean;
                                    mdContent += `Ja/Nein | Text für WAHR: ${p.trueLabel}, Text für FALSCH: ${p.falseLabel}`
                                    console.log('paso4');
                                    console.log(mdContent);
                                }
                                mdContent += ` | ${e.id} |\n`;
                                console.log(mdContent);
                            })
                            mdContent += quartoMode ? '\n: {tbl-colwidths="[15,15,55,15]"}\n\n' : '\n';
                            console.log(mdContent);
                        })


                        // p.groups.forEach(g => {
                        //     if (p.groups.length > 1) mdContent += quartoMode ? `## ${g.label}\n\n` : `### ${g.label}\n\n`;
                        //     mdContent += '| Name/Label | Typ | Parameter | ID Profil-Eintrag |\n';
                        //     mdContent += '| :--- | :---: | :--- | :---: |\n';
                        //     console.log(mdContent);
                        //     g.entries.forEach(e => {
                        //         mdContent += `| ${e.label} | `;
                        //         console.log('paso3');
                        //         console.log(mdContent);
                        //         if (e.type === 'vocabulary' && e.parameters) {
                        //             const p = e.parameters as ProfileEntryParametersVocabulary;
                        //             const levelText = p.maxLevel > 1 ? ', Zeige nur erste ' + p.maxLevel + ' Ebenen' : ', Zeige nur erste Ebene';
                        //             mdContent += `[Vokabular](${p.url}) | url: '${p.url}', ${p.allowMultipleValues ? 'Mehrfachauswahl' : 'Einmalauswahl'}${p.maxLevel > 0 ? levelText : ''}${p.hideNumbering ? ', Nummerierung unterdrückt' : ''}${p.hideTitle ? ', Titel unterdrückt' : ''}${p.hideDescription ? ', Beschreibung unterdrückt' : ''}${p.addTextLanguages && p.addTextLanguages.length > 0 ? ', mit Texteingabe in Sprache(n): ' + p.addTextLanguages.join('/') : ''}`
                        //         } else if (e.type === 'text' && e.parameters) {
                        //             const p = e.parameters as ProfileEntryParametersText;
                        //             mdContent += `Text | ${p.format}, Sprache(n): ${p.textLanguages.join('/')}${p.pattern ? ', Gültigkeitsmuster: ' + p.pattern : ''} `
                        //         } else if (e.type === 'numbers' && e.parameters) {
                        //             const p = e.parameters as ProfileEntryParametersNumber;
                        //             mdContent += `Zahl | Kommastellen: ${p.digits}, Mindestwert: ${p.minValue === null ? 'kein' : p.minValue}, Maximalwert: ${p.maxValue === null ? 'kein' : p.maxValue}${p.isPeriodSeconds ? ', als Sekunden' : ''}`
                        //         } else if (e.type === 'boolean' && e.parameters) {
                        //             const p = e.parameters as ProfileEntryParametersBoolean;
                        //             mdContent += `Ja/Nein | Text für WAHR: ${p.trueLabel}, Text für FALSCH: ${p.falseLabel}`
                        //         }
                        //         mdContent += ` | ${e.id} |\n`;
                        //         console.log(mdContent);
                        //     })
                        //     mdContent += quartoMode ? '\n: {tbl-colwidths="[15,15,55,15]"}\n\n' : '\n';
                        //     console.log(mdContent);
                        // })
                    })

                } else {
                    mdContent += 'Keine Profile definiert.\n';
                    console.log('\x1b[0;33mWARNING\x1b[0m no profiles found');
                }
                fs.writeFileSync(mdTargetFilename, mdContent, {encoding: 'utf8'});
                console.log(mdContent);
                console.log(`markdown file "${mdTargetFilename}" generated.`);
            } else {
                console.log(`\x1b[0;31mERROR\x1b[0m TargetFolder '${mdTargetFolder}' not found`);
                process.exitCode = 1;
            }
    }).catch(err => {
            console.log(`\x1b[0;31mERROR\x1b[0m profile store '${configFileName}' not valid`);
            process.exitCode = 1;
    });
