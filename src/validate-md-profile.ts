#!/usr/bin/env node
import {SchemaValidateFactory} from "./schema-validate.factory";

const fs = require('fs');
const schemaFilename = 'md-profile.schema.json';
let fileToCheckName = './profile.json';
if (process.argv[2]) {
    fileToCheckName = `./${process.argv[2]}`;
}
let schemaFullFilename = `${__dirname}/${schemaFilename}`;
if (!fs.existsSync(schemaFullFilename)) {
    schemaFullFilename = `./json_schema/md-profile/${schemaFilename}`;
}

const myMDProfile = SchemaValidateFactory.validateProfile(fileToCheckName, schemaFullFilename);
if (myMDProfile) console.log(`${myMDProfile.groups.length} groups found in '${fileToCheckName}'.`);
