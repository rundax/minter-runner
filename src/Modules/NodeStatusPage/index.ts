import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {Core} from '@Core/App';
import {BaseModule} from '@Core/BaseModule';
import {ProbeReadyEvents, ProbeReadyServiceStatus} from '@Core/Probe';
import {NodeRunnerEvents} from '../NodeRunner/Events';
import {ProbeLivenessEvents, ProbeLivenessServiceStatus} from '@Core/Probe/ProbeLiveness';
import {NodeCliEvents} from '../NodeCli/Events';
import {NodeProcessConfig} from '../NodeRunner/interfaces';
import {Http} from '@Core/Http';
import * as Router from 'koa-router';
import {Context} from 'koa';
import * as Handlebars from 'handlebars';

export class NodeStatusPage extends BaseModule<NodeStatusPage> {

    private options: NodeStatusPageConfig;
    private http: Http;
    private bus: EventBusInterface<SimpleEventBus>;

    public constructor(options: NodeStatusPageConfig) {
        super();
        this.options = options;
        this.http = Core.app().getService<Http>('http');
        this.bus = Core.app().bus();
    }


    public init(): Promise<boolean | NodeStatusPage> {
        if (this.options.enabled === true) {
            this.http.registerRoutes(this.getHttpRoutes());
        }
        return Promise.resolve(this);
    }

    public run(): Promise<boolean | NodeStatusPage> {
        return Promise.resolve(this);
    }

    public getHttpRoutes(): Router {
        let router = new Router();
        router
            .get('/', this.statusPage.bind(this));

        return router;
    }


    private async statusPage(ctx: Context) {
        let content = require('./page.hbs')({generalApiUrl: this.options.generalApiUrl});
        Handlebars.compile(require('./page.hbs')().toString());
        ctx.body = content;
    }

}

export interface NodeStatusPageConfig {
    enabled: boolean;
    generalApiUrl: string;
}
