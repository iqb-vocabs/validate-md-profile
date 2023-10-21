#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";

let configFileName = './profile-config.json';
if (process.argv[2]) {
    configFileName = `./${process.argv[2]}`;
}

const mdConfig = SchemaValidateFactory.validateConfig(configFileName);
if (mdConfig) {
    console.log(`config file '${configFileName}' is valid: ${mdConfig.title}`);
    mdConfig.profiles.forEach(p => {
        const myMDProfile = SchemaValidateFactory.validateProfile(p);
        if (myMDProfile) console.log(`${myMDProfile.groups.length} groups found in '${p}'.`);
    })
}
