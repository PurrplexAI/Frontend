import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

function format(kind: string, message: string): string {
    return `[ ${kind} ] ${message}`;
}

function getNodeEnv(): string | undefined {
    return process.env.NODE_ENV;
}

function getEnvVariable(key: string): string {
    const errorMessage = getNodeEnv() === 'development'
        ? format('ENV', `Environment variable ${key} is required`)
        : "We're having trouble right now, please try again later.";

    let value = process.env[key];
    
    if (value) {
        return value;
    }

    const env = dotenv.config().parsed || {};
    value = env[key];

    if (value) {
        return value;
    }

    throw new Error(errorMessage);
}

export {
    format,
    getNodeEnv,
    getEnvVariable
};