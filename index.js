#!/usr/bin/env node
'use strict';

const path    = require('path');
const fs      = require('fs');
const request = require('superagent');
const {get}   = require('lodash');

const getLatestVersion = async pluginName => {
    const response = await request.get(`https://api.wordpress.org/plugins/info/1.0/${pluginName}.json`);
    return get(response, 'body.version');
};

(async () => {

    const composerPath = path.join(process.cwd(), 'composer.json');

    let composer;
    try {
        composer = JSON.parse(fs.readFileSync(composerPath));
    } catch (e) {
        console.warn(`Could not read from ${composerPath}, does it exist?`);
        process.exit(0);
    }

    const require = composer.require;

    for (const pkg in require) {
        const matches = /wpackagist-plugin\/(.*)/.exec(pkg);
        if (matches === null) continue;
        const pluginName        = matches[1];
        const latestVersion     = await getLatestVersion(pluginName)
        const currentConstraint = require[pkg];
        console.log(`${pluginName}: ${currentConstraint} => ${latestVersion}`);
    }
})();