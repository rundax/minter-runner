'use strict';
import {config, DotenvParseOutput} from 'dotenv';
import * as fs from 'fs';
import {ChildProcessWithoutNullStreams} from 'child_process';

export function inArray(arr:string[] | number[] = [], val:string|number): boolean {
    let len = arr.length;
    let i;

    for (i = 0; i < len; i++) {
        if (arr[i] === val) {
            return true;
        }
    }
    return false;
}

export function env(key: string, defaultValue: any = null): string {
    return process.env[key] ? process.env[key] :  defaultValue;
}

/**
 *
 * @param key
 * @param defaultValue
 * @param radix
 */
export function envNumber(key: string, defaultValue: number = null, radix: number): number {
    return process.env[key] ? parseInt(process.env[key], radix) :  defaultValue;
}


/**
 *
 * @param key
 * @param defaultValue
 */
export function envBoolean(key: string, defaultValue: boolean): boolean {
    let value = process.env[key] ? process.env[key] : defaultValue;
    // @ts-ignore
    switch (value) {
        case true:
        case 'true':
        case '1':
        case 'on':
        case 'yes':
            return true;
        default:
            return false;
    }
}


export function loadEnvFile(path: string): boolean | DotenvParseOutput {
    try {
        fs.accessSync(path, fs.constants.R_OK);
        console.log('Load env vars from file: ' + path);
        const dotEnv = config({ path: path});

        if (dotEnv.error !== undefined) {
            console.log('Can not parse .env file in ');
            console.log(dotEnv.error);
            return false;
        }
        return dotEnv.parsed;
    } catch (err) {
        return true;
    }

}

export function processSignalDebug(name: string, stream: ChildProcessWithoutNullStreams) {
    console.log('Debug process:', stream.spawnargs.join(' '));
    return;
    stream.on('beforeExit', () => {console.log(name + ' send => beforeExit'); });
    stream.on('disconnect', () => {console.log(name + ' send => disconnect'); });
    stream.on('rejectionHandled', () => {console.log(name + ' send => rejectionHandled'); });
    stream.on('uncaughtException', () => {console.log(name + ' send => uncaughtException'); });
    stream.on('unhandledRejection', () => {console.log(name + ' send => unhandledRejection'); });
    stream.on('warning', (warning: Error) => {console.log(name + ' send => warning' , warning); });
    stream.on('message', () => {console.log(name + ' send => message'); });
    stream.on('removeListener', (type: string) => {console.log(name + ' send => removeListener' , type); });
    stream.on('multipleResolves', () => {console.log(name + ' send => multipleResolves '); });
    stream.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        if (code !== 0 ) {
            console.error(name + ' send => exit:' + code + ' by signal ' + signal);
        } else {
            console.info(name + ' send => exit:' + code + ' by signal ' + signal);
        }
    });

    stream.on('SIGABRT', (...args: any[]) => {console.log(name + ' send => SIGABRT. args:' + args); });
    stream.on('SIGALRM', (...args: any[]) => {console.log(name + ' send => SIGALRM. args:' + args); });
    stream.on('SIGBUS', (...args: any[]) => {console.log(name + ' send => SIGBUS. args:' + args); });
    stream.on('SIGCHLD', (...args: any[]) => {console.log(name + ' send => SIGCHLD. args:' + args); });
    stream.on('SIGCONT', (...args: any[]) => {console.log(name + ' send => SIGCONT. args:' + args); });
    stream.on('SIGFPE', (...args: any[]) => {console.log(name + ' send => SIGFPE. args:' + args); });
    stream.on('SIGHUP', (...args: any[]) => {console.log(name + ' send => SIGHUP. args:' + args); });
    stream.on('SIGILL', (...args: any[]) => {console.log(name + ' send => SIGILL. args:' + args); });
    stream.on('SIGINT', (...args: any[]) => {console.log(name + ' send => SIGINT. args:' + args); });
    stream.on('SIGIO', (...args: any[]) => {console.log(name + ' send => SIGIO. args:' + args); });
    stream.on('SIGIOT', (...args: any[]) => {console.log(name + ' send => SIGIOT. args:' + args); });
    stream.on('SIGPIPE', (...args: any[]) => {console.log(name + ' send => SIGPIPE. args:' + args); });
    stream.on('SIGPOLL', (...args: any[]) => {console.log(name + ' send => SIGPOLL. args:' + args); });
    stream.on('SIGPROF', (...args: any[]) => {console.log(name + ' send => SIGPROF. args:' + args); });
    stream.on('SIGPWR', (...args: any[]) => {console.log(name + ' send => SIGPWR. args:' + args); });
    stream.on('SIGQUIT', (...args: any[]) => {console.log(name + ' send => SIGQUIT. args:' + args); });
    stream.on('SIGSEGV', (...args: any[]) => {console.log(name + ' send => SIGSEGV. args:' + args); });
    stream.on('SIGSTKFLT', (...args: any[]) => {console.log(name + ' send => SIGSTKFLT. args:' + args); });
    stream.on('SIGSYS', (...args: any[]) => {console.log(name + ' send => SIGSYS. args:' + args); });
    stream.on('SIGTERM', (...args: any[]) => {console.log(name + ' send => SIGTERM. args:' + args); });
    stream.on('SIGTRAP', (...args: any[]) => {console.log(name + ' send => SIGTRAP. args:' + args); });
    stream.on('SIGTSTP', (...args: any[]) => {console.log(name + ' send => SIGTSTP. args:' + args); });
    stream.on('SIGTTIN', (...args: any[]) => {console.log(name + ' send => SIGTTIN. args:' + args); });
    stream.on('SIGTTOU', (...args: any[]) => {console.log(name + ' send => SIGTTOU. args:' + args); });
    stream.on('SIGUNUSED', (...args: any[]) => {console.log(name + ' send => SIGUNUSED. args:' + args); });
    stream.on('SIGURG', (...args: any[]) => {console.log(name + ' send => SIGURG. args:' + args); });
    stream.on('SIGUSR1', (...args: any[]) => {console.log(name + ' send => SIGUSR1. args:' + args); });
    stream.on('SIGUSR2', (...args: any[]) => {console.log(name + ' send => SIGUSR2. args:' + args); });
    stream.on('SIGVTALRM', (...args: any[]) => {console.log(name + ' send => SIGVTALRM. args:' + args); });
    stream.on('SIGWINCH', (...args: any[]) => {console.log(name + ' send => SIGWINCH. args:' + args); });
    stream.on('SIGXCPU', (...args: any[]) => {console.log(name + ' send => SIGXCPU. args:' + args); });
    stream.on('SIGXFSZ', (...args: any[]) => {console.log(name + ' send => SIGXFSZ. args:' + args); });
    stream.on('SIGBREAK', (...args: any[]) => {console.log(name + ' send => SIGBREAK. args:' + args); });
    stream.on('SIGLOST', (...args: any[]) => {console.log(name + ' send => SIGLOST. args:' + args); });
    stream.on('SIGINFO', (...args: any[]) => {console.log(name + ' send => SIGINFO. args:' + args); });

    stream.stdout.on('close', () => { console.log(name + ' send => close'); });
    stream.stdout.on('data', (chunk: any) => { console.log(name + ' send => data ' + chunk); });
    stream.stdout.on('end', () => { console.log(name + ' send => end'); });
    stream.stdout.on('error', (err: Error) => { console.log(name + ' send => error. ' + err); });
    stream.stdout.on('pause', () => { console.log(name + ' send => pause'); });
    stream.stdout.on('readable', () => { console.log(name + ' send => readable'); });
    stream.stdout.on('resume', () => { console.log(name + ' send => resume'); });
}
