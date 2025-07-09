import Ajv from "ajv";
import {LanguageCodedText, MDProfileEntry} from "@iqbspecs/metadata-profile/metadata-profile.interface";

// replace interfaces to imports
export interface MDProfileStore {
    id: string,
    publisher: string,
    maintainer: string,
    title: LanguageCodedText[],
    profiles: string[]
}

export interface MDProfileGroup {
    label: LanguageCodedText[],
    entries: MDProfileEntry[];
}

export interface MDProfile {
    id: string,
    label: LanguageCodedText[],
    groups: MDProfileGroup[];
}

const profileSchema = "https://raw.githubusercontent.com/nanoyan/metadata-profile/refs/heads/main/metadata-profile.schema.json";
const storeSchema = "https://raw.githubusercontent.com/nanoyan/metadata-store/refs/heads/main/metadata-store.schema.json";
export abstract class SchemaValidateFactory {
    public static async validateProfile(sourceFilename: string): Promise<MDProfile | null> {
        let mdProfile: MDProfile | null = null;
        const fs = require('fs');
        let compiledSchema;
        const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

        const response = await fetch(profileSchema);
        const profile: MDProfile = await response.json();

        try {
          compiledSchema = ajv.compile(profile);
        } catch (err) {
            console.log('\x1b[0;31mERROR\x1b[0m parsing profile schema');
            console.error(err);
            process.exitCode = 1;
            compiledSchema = null;
        }
        if (compiledSchema) {
            if (fs.existsSync(sourceFilename)) {
                let profileData;
                try {
                    const profile_data_raw = fs.readFileSync(sourceFilename, 'utf8');
                    profileData = JSON.parse(profile_data_raw);
                } catch (err) {
                    console.log(`\x1b[0;31mERROR\x1b[0m reading and parsing profile file '${sourceFilename}':`);
                    console.error(err);
                    profileData = null;
                    process.exitCode = 1;
                }
                if (profileData) {
                    try {
                        const valid = compiledSchema ? compiledSchema(profileData) : null;
                        if (!valid) {
                            console.log(`\x1b[0;31mERROR\x1b[0m invalid profile file '${sourceFilename}':`);
                            console.error(compiledSchema ? compiledSchema.errors : 'error unknown')
                            profileData = null;
                            process.exitCode = 1;
                        }
                    } catch (err) {
                        console.log(`\x1b[0;31mERROR\x1b[0m invalid profile file '${sourceFilename}':`);
                        console.error(err);
                        profileData = null;
                        process.exitCode = 1;
                    }
                    if (profileData) {
                        try {
                            mdProfile = {
                                id: profileData.id,
                                label: profileData.label,
                                groups: profileData.groups
                            };
                        } catch (err) {
                            console.log(`\x1b[0;31mERROR\x1b[0m parsing profile file '${sourceFilename}':`);
                            console.error(err);
                            mdProfile = null;
                            process.exitCode = 1;
                        }
                        if (mdProfile) {
                            let doubleIds: string[] = [];
                            let allEntryIds: string[] = [];
                            let entryCount = 0;
                            mdProfile.groups.forEach(g => {
                                g.entries.forEach(e => {
                                    if (allEntryIds.includes(e.id)) {
                                        doubleIds.push(e.id);
                                    } else {
                                        allEntryIds.push(e.id);
                                    }
                                })
                                entryCount += g.entries.length;
                            })
                            console.log(`${mdProfile.groups.length} ${mdProfile.groups.length === 1 ? 'group' : 'groups'} and ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} found in '${sourceFilename}'.`);
                            if (doubleIds.length > 0) {
                                console.log(`\x1b[0;31mERROR\x1b[0m in profile file '${sourceFilename}': double ids ${doubleIds.join(', ')}`);
                                mdProfile = null;
                                process.exitCode = 1;
                            }
                        }
                    }
                }
            } else {
                console.log(`\x1b[0;31mERROR\x1b[0m profile file '${sourceFilename}' not found`);
                process.exitCode = 1;
            }
        }
        return mdProfile ;
    }

    public static async validateConfig(sourceFilename: string): Promise<MDProfileStore | null> {
        let mdStore: MDProfileStore | null = null;
        const fs = require('fs');
        let compiledSchema;
        const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

        const response = await fetch(storeSchema);
        const store: MDProfileStore = await response.json();
        try {
            compiledSchema = ajv.compile(store);
        } catch (err) {
            console.log('\x1b[0;31mERROR\x1b[0m parsing profile config schema');
            console.error(err);
            process.exitCode = 1;
            compiledSchema = null;
        }
        if (compiledSchema) {
            if (fs.existsSync(sourceFilename)) {
                let profileStoreData;
                try {
                    const config_data_raw = fs.readFileSync(sourceFilename, 'utf8');
                    profileStoreData = JSON.parse(config_data_raw);
                } catch (err) {
                    console.log(`\x1b[0;31mERROR\x1b[0m reading and parsing config file '${sourceFilename}':`);
                    console.error(err);
                    profileStoreData = null;
                    process.exitCode = 1;
                }
                if (profileStoreData) {
                    try {
                        const valid = compiledSchema ? compiledSchema(profileStoreData) : null;
                        if (!valid) {
                            console.log(`\x1b[0;31mERROR\x1b[0m invalid config file '${sourceFilename}':`);
                            console.error(compiledSchema ? compiledSchema.errors : 'error unknown')
                            profileStoreData = null;
                            process.exitCode = 1;
                        }
                    } catch (err) {
                        console.log(`\x1b[0;31mERROR\x1b[0m invalid config file '${sourceFilename}':`);
                        console.error(err);
                        profileStoreData = null;
                        process.exitCode = 1;
                    }
                    if (profileStoreData) {
                        try {
                            mdStore = {
                                id: profileStoreData.id,
                                title: profileStoreData.title,
                                publisher: profileStoreData.publisher,
                                maintainer: profileStoreData.maintainer,
                                profiles: profileStoreData.profiles
                            };
                        } catch (err) {
                            console.log(`\x1b[0;31mERROR\x1b[0m instanciating profile store '${sourceFilename}':`);
                            console.error(err);
                            mdStore = null;
                            process.exitCode = 1;
                        }
                    }
                }
            } else {
                console.log(`\x1b[0;31mERROR\x1b[0m config file '${sourceFilename}' not found`);
                process.exitCode = 1;
            }
        }
        return mdStore;
    }
}
