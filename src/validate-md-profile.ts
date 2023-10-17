import Ajv from "ajv";

const fs = require('fs');
const schemaFilename = 'md-profile.schema.json';
let fileToCheckName = './profile.json';
let schema = null;
if (process.argv[2]) {
    fileToCheckName = `./${process.argv[2]}`;
}
if (!fs.existsSync(fileToCheckName)) {
    console.log(`\x1b[0;31mERROR\x1b[0m profile file '${fileToCheckName}' not found`);
    process.exitCode = 1;
} else {
    let schemaFullFilename = `${__dirname}/${schemaFilename}`;
    if (!fs.existsSync(schemaFullFilename)) {
        schemaFullFilename = `./json_schema/md-profile/${schemaFilename}`;
    }
    if (!fs.existsSync(schemaFullFilename)) {
        console.log(`\x1b[0;31mERROR\x1b[0m profile file '${schemaFilename}' not found`);
        process.exitCode = 1;
    } else {
        try {
            schema = fs.readFileSync(schemaFullFilename, 'utf8');
        } catch (err) {
            console.log(`\x1b[0;31mERROR\x1b[0m reading schema '${schemaFilename}':`);
            console.error(err);
            process.exitCode = 1;
            schema = null;
        }
    }
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
        let profileData;
        try {
            const profile_data_raw = fs.readFileSync(fileToCheckName, 'utf8');
            profileData = JSON.parse(profile_data_raw);
        } catch (err) {
            console.log(`\x1b[0;31mERROR\x1b[0m reading and parsing config file '${fileToCheckName}':`);
            console.error(err);
            profileData = null;
            process.exitCode = 1;
        }
        if (profileData) {
            try {
                const valid = compiledSchema ? compiledSchema(profileData) : null;
                if (valid) {
                    console.log(`'${fileToCheckName}' is valid`);
                } else {
                    console.log(`\x1b[0;31mERROR\x1b[0m invalid profile file '${fileToCheckName}':`);
                    console.error(compiledSchema ? compiledSchema.errors : 'error unknown')
                    profileData = null;
                    process.exitCode = 1;
                }
            } catch (err) {
                console.log(`\x1b[0;31mERROR\x1b[0m invalid profile file '${fileToCheckName}':`);
                console.error(err);
                profileData = null;
                process.exitCode = 1;
            }
        }
    }
}
