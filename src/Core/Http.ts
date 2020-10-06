import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as combineRouters from 'koa-combine-routers';
import * as bodyParser from 'koa-bodyparser';
import * as http from 'http';
import {Core} from '@Core/App';
export class Http {

    private config: HttpServerConfigInterface;
    private http: http.Server;
    private koa: Koa;
    private routers: any[] = [];

    public constructor(config: HttpServerConfigInterface) {
        this.config = config;
    }

    public init(): Http {
        this.koa = new Koa();
        this.http = http.createServer(this.koa.callback());

        const shutdown = require('koa-graceful-shutdown');
        this.koa.use(shutdown(this.http, {
            logger: console,
            forceTimeout: (30 * 1000) // Defaults to 30s
        }));
        const requestId = require('koa-requestid');
        this.koa.use(bodyParser({
            enableTypes: ['json', 'form', 'text'],
            onerror: function (err, ctx) {
                ctx.throw('body parse error', 422);
            }
        }));
        this.koa.use(requestId());

        return this;
    }

    public registerRoutes(router: Router): void {
        this.routers.push(router);
    }

    public start(): Promise<Http> {
        return new Promise<Http | any>((resolve, reject) => {
            this.koa.use(combineRouters(this.routers)());
            this.koa.use(async (ctx, next) => {
                try {
                    await next();
                } catch (err) {
                    reject(err);
                }
            });
            this.http.listen(this.config.port, () => {
                Core.info('Listening on:', [this.config.host, this.config.port], 'ApiServer');
                resolve(this);
            });
        });
    }

}

export interface HttpServerConfigInterface {
    host: string;
    port: number;
    timeout: number;
}
