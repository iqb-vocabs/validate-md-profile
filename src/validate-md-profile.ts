#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";

let configFileName = './profile-config.json';
if (process.argv[2]) {
    configFileName = `./${process.argv[2]}`;
}

const fs = require('fs');
const configSchemaFilename = 'md-profile-config.schema.json';
let configSchemaFullFilename = `${__dirname}/${configSchemaFilename}`;
if (!fs.existsSync(configSchemaFullFilename)) {
    configSchemaFullFilename = `./json_schema/md-profile-config/${configSchemaFilename}`;
}

const mdConfig = SchemaValidateFactory.validateConfig(configFileName, configSchemaFullFilename);
if (mdConfig) {
    console.log(`config file '${configFileName}' is valid.`);
    const profileSchemaFilename = 'md-profile.schema.json';
    let profileSchemaFullFilename = `${__dirname}/${profileSchemaFilename}`;
    if (!fs.existsSync(profileSchemaFullFilename)) {
        profileSchemaFullFilename = `./json_schema/md-profile/${profileSchemaFilename}`;
    }
    mdConfig.profiles.forEach(p => {
        const myMDProfile = SchemaValidateFactory.validateProfile(p, profileSchemaFullFilename);
        if (myMDProfile) console.log(`${myMDProfile.groups.length} groups found in '${p}'.`);
    })
}



