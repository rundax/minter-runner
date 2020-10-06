import {BaseModule} from '@Core/BaseModule';
import {NodeProcessConfig} from '../NodeRunner/interfaces';
import {Core} from '@Core/App';
import {Http} from '@Core/Http';
import * as Router from 'koa-router';
import {Context} from 'koa';
import {spawn} from 'child_process';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {NodeCliEvents} from './Events';

export class NodeCli extends BaseModule<NodeCli> {

    private options: NodeProcessConfig;
    private http: Http;
    private bus: EventBusInterface<SimpleEventBus>;

    public constructor(options: NodeProcessConfig) {
        super();
        this.options = options;
        this.http = Core.app().getService<Http>('http');
        this.bus = Core.app().bus();
    }

    public init(): Promise<boolean | NodeCli> {
        this.http.registerRoutes(this.getHttpRoutes());
        this.bus.on(NodeCliEvents.GET_NET_INFO, () => {
            this.runConsoleCommand(['manager', 'net_info', '-j'])
                .then((data) => {
                this.bus.emit(NodeCliEvents.RES_NET_INFO, data);
                })
                .catch(() => {
                    this.bus.emit(NodeCliEvents.RES_NET_INFO, {
                        countPeers: 0,
                        peers: []
                    });
                });
        });
        return Promise.resolve(undefined);
    }

    public run(): Promise<boolean | NodeCli> {
        return Promise.resolve(undefined);
    }

    public getHttpRoutes(): Router {
        let router = new Router({prefix: '/cli'});
        router
            .post('/dial_peer', this.dialPeer.bind(this))
            .post('/prune_blocks', this.pruneBlocks.bind(this))
            .get('/status', this.status.bind(this))
            .get('/net_info', this.netInfo.bind(this))
            .get('/node_id', this.nodeId.bind(this));

        return router;
    }

    private async dialPeer(ctx: Context) {
        let address = parseInt(ctx.request.body.address ?? '');
        let persistent = ctx.request.body.persistent === true;
        await this.runConsoleCommand(['manager', 'dial_peer', '--address=' + address, '--persistent=' + persistent])
            .then((data) => {
                ctx.status = 200;
                ctx.body = data;
            })
            .catch((error) => {
                ctx.status = 500;
                ctx.body = error;
            });
    }

    private async pruneBlocks(ctx: Context) {
        let from = parseInt(ctx.request.body.from ?? 0);
        let to = parseInt(ctx.request.body.to ?? 0);
        await this.runConsoleCommand(['manager', 'prune_blocks', '--from=' + from, '--to=' + to])
            .then((data) => {
                ctx.status = 200;
                ctx.body = data;
            })
            .catch((error) => {
                ctx.status = 500;
                ctx.body = error;
            });
    }

    private async status(ctx: Context) {
        await this.runConsoleCommand(['manager', 'status', '-j'])
            .then((data) => {
                ctx.status = 200;
                ctx.body = data;
            })
            .catch((error) => {
                ctx.status = 500;
                ctx.body = error;
            });
    }

    private async netInfo(ctx: Context) {

        await this.runConsoleCommand(['manager', 'net_info', '-j'])
            .then((data) => {
                ctx.status = 200;
                ctx.body = data;
            })
            .catch((error) => {
                ctx.status = 500;
                ctx.body = error;
            });
    }

    private async nodeId(ctx: Context) {
        await this.runConsoleCommand(['show_node_id'])
            .then((data) => {
                ctx.status = 200;
                ctx.body = data;
            })
            .catch((error) => {
                ctx.status = 500;
                ctx.body = error;
            });
    }

    public runConsoleCommand(command: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let params = ['--home-dir=' + this.options.home].concat(command);
            Core.info('Console request:', [this.options.binFilePath, params]);
            const cliProcess  = spawn(this.options.binFilePath, params, { stdio: ['pipe', 'pipe', 'pipe'] });

            cliProcess.stdout.on('data', (data: any) => {
                cliProcess.kill();
                let result = Buffer.from(data, 'utf-8').toString();
                try {
                    resolve(JSON.parse(result));
                }
                catch (e) {
                    reject(e);
                }
            });
            // @ts-ignore
            cliProcess.stderr.on('data', (data) => {
                cliProcess.kill();
                let result = Buffer.from(data, 'utf-8').toString();
                reject(result);
            });
        });
    }


}
