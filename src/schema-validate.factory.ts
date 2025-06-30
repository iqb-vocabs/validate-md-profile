import Ajv from "ajv";
// import {MDProfile, MDProfileStore, profileSchemaJSON, profileStoreSchemaJSON} from "@iqb/metadata";
// profileSchemaJSON =
import {LanguageCodedText, MDProfileEntry} from "@iqbspecs/metadata-profile/metadata-profile.interface";

export interface MDProfileStore {
    id: string,
    publisher: string,
    maintainer: string,
    title: string,
    profiles: string[]
}

export interface MDProfileGroup {
    label: string,
    entries: MDProfileEntry[];
}

export interface MDProfile {
    id: string,
    label: LanguageCodedText[],
    groups: MDProfileGroup[];
}

async function loadJSONFromGitHub(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch JSON: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading JSON from GitHub:", error);
        throw error;
    }
}

export abstract class SchemaValidateFactory {
    public static validateProfile(sourceFilename: string): MDProfile | null {
        let mdProfile: MDProfile | null = null;
        const fs = require('fs');
        let compiledSchema;
        const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
        try {
           // compiledSchema = ajv.compile(profileSchemaJSON)

            compiledSchema = ajv.compile(loadJSONFromGitHub("https://raw.githubusercontent.com/nanoyan/metadata-profile/refs/heads/main/metadata-profile.schema.json"));
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
                            mdProfile.groups.forEach(g => {
                                g.entries.forEach(e => {
                                    if (allEntryIds.includes(e.id)) {
                                        doubleIds.push(e.id);
                                    } else {
                                        allEntryIds.push(e.id);
                                    }
                                })
                            })
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
        return mdProfile;
    }

    public static validateConfig(sourceFilename: string): MDProfileStore | null {
        let mdStore: MDProfileStore | null = null;
        const fs = require('fs');
        let compiledSchema;
        const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
        try {
            // compiledSchema = ajv.compile(profileStoreSchemaJSON)
            compiledSchema = ajv.compile(loadJSONFromGitHub("https://raw.githubusercontent.com/nanoyan/metadata-store/refs/heads/main/metadata-store.schema.json"));
            console.log(compiledSchema);
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
                            // mdStore = new MDProfileStore(profileStoreData);
                            mdStore = {
                                id: profileStoreData.id,
                                title: profileStoreData.label,
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
