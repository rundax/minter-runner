import {env, loadEnvFile, processSignalDebug} from './Helpers/functions';
import {Logger} from '@elementary-lab/logger/src';
import {ConsoleTarget} from '@elementary-lab/logger/src/Targets/ConsoleTarget';
import {LogLevel} from '@elementary-lab/logger/src/Types';
import * as fs from 'fs';
import * as tar from 'tar-stream';
import {spawn} from 'child_process';


const logger = new Logger({
    flushInterval: 1,
    traceLevel: 3,
    targets: [
        new ConsoleTarget({
            enabled: true,
            levels: [LogLevel.INFO, LogLevel.ERROR, LogLevel.NOTICE, LogLevel.DEBUG, LogLevel.WARNING, LogLevel.EMERGENCY]
        }),
    ]
});

const lockFile: string = env('APP_BLOCKCHAIN_HOME') + 'recovery.lock';
const dataDir: string = env('APP_BLOCKCHAIN_HOME');


const envLoader = loadEnvFile(process.cwd() + '/.env.local');
if (envLoader === false) {
    logger.info('Can not load .env.local');
    process.exit(1);
}

const downloadUrl = env('APP_DUMP_URL', '');

if (downloadUrl === '') {
    logger.info('Env var APP_DUMP_URL is not set. Skip backup downloader');
    process.exit(0);
}

logger.info('Start backup restoring');

async function checkExistLockFile(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.access(lockFile, fs.constants.R_OK, (err: any) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });

}

checkExistLockFile()
    .then(() => {
        logger.info('Lock file already exist');
        process.exit(0);
    })
    .catch(() => {
        logger.info('Lock file not found. Download dump');
        (async () => {
            try {
                await downloadDump();
                await unpackDump('blockchain/data/');
                await unpackDump('blockchain/tmdata/');
                fs.unlinkSync('/tmp/minter_backup.tar');
                fs.closeSync(fs.openSync(lockFile, 'w'));
            }  catch (err) {
                logger.error(err);
                process.exit(1);
            }
        })();
    });




async function downloadDump() {
    return new Promise<void>((resolve, reject) => {
        const downloader = spawn('aria2c', [
            '--max-connection-per-server=16',
            '--max-concurrent-downloads=16',
            '--continue=true',
            '--max-tries=50',
            '--retry-wait=2',
            '--split=20',
            // '--dry-run',
            '--file-allocation=none',
            '--continue=true',
            '--dir=/tmp',
            '--out=minter_backup.tar',
            downloadUrl
        ]);

        downloader.stdout.pipe(process.stdout, { end: false });
        downloader.stderr.pipe(process.stderr, { end: false });

        processSignalDebug('downloader', downloader);

        downloader.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('Can not download file!'));
            }});
    });
}

async function unpackDump(filePath: string) {
    return new Promise<void>((resolve, reject) => {
        const unpacker = spawn('tar', [
            '--extract',
            '--verbose',
            '--strip-components=1',
            '--file=/tmp/minter_backup.tar',
            '--directory',
            dataDir,
            filePath
        ]);
        processSignalDebug('unpacker', unpacker);
        unpacker.stdout.pipe(process.stdout, { end: false });
        unpacker.stderr.pipe(process.stderr, { end: false });
        unpacker.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('Can not unpack tar file!'));
            }});
    });
}

async function moveFile(path: string) {
    return new Promise<void>((resolve, reject) => {
        const unpacker = spawn('mv', [
            '--verbose', // Extract a tar ball.
            '--force', // Extract a tar ball.
            dataDir + path,
            dataDir,
        ]);
        processSignalDebug('unpacker', unpacker);
        unpacker.stdout.pipe(process.stdout, { end: false });
        unpacker.stderr.pipe(process.stderr, { end: false });
        unpacker.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('Can not unpack tar file!'));
            }});
    });
}
