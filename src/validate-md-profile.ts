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
        if (myMDProfile) {
            let entryCount = 0;
            myMDProfile.groups.forEach(g=> {
                entryCount += g.entries.length;
            });
            console.log(`${myMDProfile.groups.length} ${myMDProfile.groups.length === 1 ? 'group' : 'groups'} and ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} found in '${p}'.`);
        }
    })
}
