'use strict';

import {ChildProcess,  spawn} from 'child_process';
import * as fs from 'fs';
import {NodeAddressBookInterface, NodeLogFormat, NodeProcessConfig} from './interfaces';
import {Core} from '@Core/App';
import {NodeRunnerEvents} from './Events';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {BaseModule} from '@Core/BaseModule';
import {ProbeReadyEvents, ProbeReadyServiceStatus} from '@Core/Probe';

export class NodeRunner extends BaseModule<NodeRunner> {

    public static readonly  STOP_SIGNAL = 'SIGTERM';

    private blockHeight: number;
    private daemon?: ChildProcess = null;
    private options:  NodeProcessConfig;
    private inShutdown: boolean = false;
    private bus: EventBusInterface<SimpleEventBus>;

    public constructor(options: NodeProcessConfig) {
        super();
        this.options = options;
        this.bus = Core.app().bus();
    }

    public init(): Promise<boolean | NodeRunner> {
        this.bus.emit(ProbeReadyEvents.REGISTER_SERVICE, 'NodeRunner');
        return Promise.resolve(this);
    }

    public run(): Promise<NodeRunner| false> {
        return new Promise<NodeRunner| false >((resolve, reject) => {
            if (!this.options.runNode) {
                return resolve(false);
            }
            if (this.daemon === null) {
                Core.info('Starting blockchain daemon', [], 'NodeRunner');
                fs.access(this.options.binFilePath, fs.constants.X_OK | fs.constants.R_OK, (err: any) => {
                    if (err) {
                        Core.emergency(
                            'Error access to executable file. He is not exist or not executable',
                            [this.options.binFilePath],
                            'NodeRunner'
                        );
                        return reject();
                    }
                    let readyProbe: ProbeReadyServiceStatus = {
                        serviceId: 'NodeRunner',
                        isReady: false,
                        state: 'Spawn new process'
                    };
                    let config = [
                        'node',
                        '--home-dir=' + this.options.home
                    ];
                    if (this.options.is_testnet === true) {
                        config.push('--testnet');
                    }
                    this.bus.emit(ProbeReadyEvents.UPDATE_SERVICE, readyProbe);
                    this.daemon = spawn(this.options.binFilePath, config);

                    Core.info('Config: ', [this.options.binFilePath + ' node --home-dir=' + this.options.home], 'NodeRunner');
                    this.subscribeOnDaemonEvents();
                    this.configurePipes();
                    let readyProbeDone: ProbeReadyServiceStatus = {
                        serviceId: 'NodeRunner',
                        isReady: true,
                        state: 'SubProcess run'
                    };
                    this.bus.emit(ProbeReadyEvents.UPDATE_SERVICE, readyProbeDone);
                    return resolve(this);
                });
            }
        });

    }


    public configurePipes(): this {
        this.daemon.stdout.on('data', (content) => {
            const data = Buffer.from(content, 'utf-8').toString().split('\n');
            data.forEach((item, index) => {
                if (item !== '') {
                    try {
                        this.parseLog(JSON.parse(item));
                    } catch (e) {
                        Core.error('Error to parse log:', [e, item]);
                        // throw e;
                    }

                }
            });

        });
        return this;
    }

    /**
     *
     * @param data
     */
    public parseLog(data: NodeLogFormat): void {

        let component = 'minter:' + data.module;
        let additional = { ... data };
        delete additional._msg;
        delete additional.level;
        delete additional.module;
        if (data.height !== undefined) {
            if (this.blockHeight !==  data.height ) {
                this.blockHeight = data.height;
                if (this.options.blockNotify) {
                    this.bus.emit(NodeRunnerEvents.NEW_BLOCK, data.height);
                }
                delete additional.height;
            }
        }
        if (this.options.logsToStdout !== true) {
            return;
        }
        switch (data.level) {
            case 'info':
                Core.info('[block:' + this.blockHeight + '] ' + data._msg, additional, component);
                break;
            case 'error':
                Core.error('[block:' + this.blockHeight + '] ' + data._msg, additional, component);
                break;
            case 'debug':
                Core.debug('[block:' + this.blockHeight + '] ' + data._msg, additional, component);
                break;

        }
    }

    /**
     * event handling through subscribe
     */
    private subscribeOnDaemonEvents(): void {
        this.daemon.stderr.on('data', (data: any) => {
            // TODO: log error
            Core.error('========Blockchain Error==========', [], 'minter:logs_parser');
            Core.error(data.toString(), [], 'minter:logs_parser');
            Core.error('==================================', [], 'minter:logs_parser');
        });

        this.daemon.on('close', (code: number) => {
            if (this.inShutdown !==  true) {
                Core.emergency('Child process exited with code: ', code);
                process.exit(99);
            }
        });
    }


    public stop(): Promise<void> {
        this.inShutdown = true;
        if (this.daemon === null) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Core.error('Can not stop blockchain node. Timeout. Kill!!!', [], 'NodeRunner');
                reject();
            }, 10000);
            this.daemon.kill(NodeRunner.STOP_SIGNAL);
            this.daemon.on('exit', (code: number) => {
                if (code !== 0) {
                    Core.info('Node exit with code:', code,  'NodeRunner');
                }
                resolve();
            });
        });
    }

}
