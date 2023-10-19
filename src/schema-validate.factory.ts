import Ajv from "ajv";
import { MDProfile } from "./md-profile-schema.classes";

export interface ConfigData {
    id: string;
    title: {
        lang: string;
        value: string
    }[];
    mdOutDir: string;
    creator: any;
    profiles: string[];
}

export abstract class SchemaValidateFactory {
    public static validateProfile(sourceFilename: string, schemaFilename: string): MDProfile | null {
        let schema;
        let mdProfile: MDProfile | null = null;
        const fs = require('fs');
        if (fs.existsSync(schemaFilename)) {
            try {
                schema = fs.readFileSync(schemaFilename, 'utf8');
            } catch (err) {
                console.log(`\x1b[0;31mERROR\x1b[0m reading schema '${schemaFilename}':`);
                console.error(err);
                process.exitCode = 1;
                schema = null;
            }
            if (schema) {
                let compiledSchema;
                const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
                try {
                    compiledSchema = ajv.compile(JSON.parse(schema))
                } catch (err) {
                    console.log(`\x1b[0;31mERROR\x1b[0m parsing schema '${schemaFilename}':`);
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
                                    mdProfile = new MDProfile(profileData);
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
            }
        } else {
            console.log(`\x1b[0;31mERROR\x1b[0m profile file '${sourceFilename}' not found`);
            process.exitCode = 1;
        }
        return mdProfile;
    }

    public static validateConfig(sourceFilename: string, schemaFilename: string): ConfigData | null {
        let schema;
        let mdConfig: ConfigData | null = null;
        const fs = require('fs');
        if (fs.existsSync(schemaFilename)) {
            try {
                schema = fs.readFileSync(schemaFilename, 'utf8');
            } catch (err) {
                console.log(`\x1b[0;31mERROR\x1b[0m reading schema '${schemaFilename}':`);
                console.error(err);
                process.exitCode = 1;
                schema = null;
            }
            if (schema) {
                let compiledSchema;
                const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
                try {
                    compiledSchema = ajv.compile(JSON.parse(schema))
                } catch (err) {
                    console.log(`\x1b[0;31mERROR\x1b[0m parsing schema '${schemaFilename}':`);
                    console.error(err);
                    process.exitCode = 1;
                    compiledSchema = null;
                }
                if (compiledSchema) {
                    if (fs.existsSync(sourceFilename)) {
                        try {
                            const config_data_raw = fs.readFileSync(sourceFilename, 'utf8');
                            mdConfig = JSON.parse(config_data_raw);
                        } catch (err) {
                            console.log(`\x1b[0;31mERROR\x1b[0m reading and parsing config file '${sourceFilename}':`);
                            console.error(err);
                            mdConfig = null;
                            process.exitCode = 1;
                        }
                        if (mdConfig) {
                            try {
                                const valid = compiledSchema ? compiledSchema(mdConfig) : null;
                                if (!valid) {
                                    console.log(`\x1b[0;31mERROR\x1b[0m invalid config file '${sourceFilename}':`);
                                    console.error(compiledSchema ? compiledSchema.errors : 'error unknown')
                                    mdConfig = null;
                                    process.exitCode = 1;
                                }
                            } catch (err) {
                                console.log(`\x1b[0;31mERROR\x1b[0m invalid config file '${sourceFilename}':`);
                                console.error(err);
                                mdConfig = null;
                                process.exitCode = 1;
                            }
                        }
                    } else {
                        console.log(`\x1b[0;31mERROR\x1b[0m config file '${sourceFilename}' not found`);
                        process.exitCode = 1;
                    }
                }
            }
        } else {
            console.log(`\x1b[0;31mERROR\x1b[0m config file '${sourceFilename}' not found`);
            process.exitCode = 1;
        }
        return mdConfig;
    }
}
