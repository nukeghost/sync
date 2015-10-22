import * as Constants from './constants';
import path from 'path';
import fs from 'fs';

const SCRIPT_DIR = path.resolve(__dirname, 'scripts');
const SCRIPT_CACHE = {};

export default function loadLuaScript(name) {
    if (SCRIPT_CACHE.hasOwnProperty(name)) {
        return SCRIPT_CACHE[name];
    }

    const fileSource = String(fs.readFileSync(path.resolve(SCRIPT_DIR, name)));
    return fileSource.replace(/\$\{([A-Za-z0-9_]+)\}/g, (_, constantName) => {
        if (Constants.hasOwnProperty(constantName)) {
            return Constants[constantName];
        } else {
            throw new Error(`Unrecognized Redis constant ${constantName}`);
        }
    });
}
