[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/%40iqb%2Fvalidate-md-profile)](https://www.npmjs.com/package/@iqb/validate-md-profile)

# Install

Metadata profiles for web applications of [IQB](https://www.iqb.hu-berlin.de) are stored in GitHub-repositories. We group metadata profiles in so-called "profile stores" to improve the handling. Every profile store resides in one GitHub repository. The entry point of the store is a config file `profile-config.json` in the root of the repo.

Best choice is to take one of the GitHub repositories of IQB as template (naming convention: `p<nn>`). You learn the parameters and files and the way to use the programming of this repo `validate-md-profile`: You see a `package.json` (nodejs-universe) and two entries:
```json
    "scripts": {
      "validate": "validate-md-profile"
    },
    "devDependencies": {
      "@iqb/validate-md-profile": "^0.5.1"
    }
```
Sure the version of the package will change...

# Validate

Calling the script will validate the `profile-config.json` in the root and all profiles listed here:
* test the syntax of all files against the JSON schema
* check whether the ids of profile entries are unique

# Generate Documentation

To support the dialog between stakeholders during the development phase, the validate-script generates one markdown file as documentation, if a `/docs`-Folder is found. 
