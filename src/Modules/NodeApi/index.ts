import {Core} from '@Core/App';

import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, Method} from 'axios';
import {BaseModule} from '@Core/BaseModule';
import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {Http} from '@Core/Http';
import * as Router from 'koa-router';
import {Context} from 'koa';
export class NodeApi extends BaseModule<NodeApi> {

    private NODE_BASE_URL:string = 'http://localhost:8843/';

    private config: any = null;
    private bus: EventBusInterface<SimpleEventBus>;
    private http: Http;
    private axiosClient: AxiosInstance;

    public constructor(config: any) {
        super();
        this.config = config;
        this.bus = Core.app().bus();
        this.http = Core.app().getService<Http>('http');
    }

    public init(): Promise<NodeApi> {
        let axiosConfig:AxiosRequestConfig = {};
        axiosConfig.baseURL = this.NODE_BASE_URL;
        axiosConfig.timeout = 10000;
        axiosConfig.responseType = 'json';
        if (this.config.debugProxy.active === true) {
            axiosConfig.proxy = {
                host: this.config.debugProxy.host,
                port: this.config.debugProxy.port
            };
        }
        this.axiosClient = axios.create(axiosConfig);
        this.http.registerRoutes(this.getHttpRoutes());
        return Promise.resolve(this);
    }

    public run(): Promise<NodeApi> {
        this.bus.on('api_request', () => {
            console.log('api request proxy');
        });
        return Promise.resolve(this);
    }

    public getHttpRoutes(): Router {
        let router = new Router({prefix: '/api'});
        router.all('/(.*)', this.apiRequestHandler.bind(this));

        return router;
    }

    private async apiRequestHandler(ctx: Context) {
         await this.request(ctx.request.method, ctx.req.url.replace('/api', ''), ctx.request.rawBody)
            .then((body: any) => {
                ctx.status = 200;
                ctx.body = body;
            })
             .catch((error: Error) => {
                 ctx.status = 500;
                 ctx.body = error.message;
             });
    }

    public async request(method: string, url: string, body: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Core.debug('Api request:', [method, url], 'NodeApi');
            this.axiosClient.request<boolean | object>({
                method: method as Method,
                url,
                data: body,
                validateStatus: function () {
                    return true;
                }
            })
                .then((response: AxiosResponse) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    Core.info('Error to get response: ', [url, error], 'NodeApi');
                    reject(error);
                });
        });
    }
}
