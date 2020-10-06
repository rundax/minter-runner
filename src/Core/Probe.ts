import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {Http} from '@Core/Http';
import {Core} from '@Core/App';
import * as Router from 'koa-router';
import {Context} from 'koa';
import {BaseModule} from '@Core/BaseModule';
import {ProbeLivenessEvents, ProbeLivenessInterface, ProbeLivenessServiceStatus} from '@Core/Probe/ProbeLiveness';

export class Probe extends BaseModule<Probe> {

    private bus: EventBusInterface<SimpleEventBus>;
    private http: Http;

    private ready: ProbeReadyInterface;
    private liveness: ProbeLivenessInterface;

    public constructor(bus?: EventBusInterface<SimpleEventBus>) {
        super();
        this.bus = bus ?? Core.app().bus();
        this.http = Core.app().getService<Http>('http');

    }

    public init(): Promise<boolean | Probe> {
        this.http.registerRoutes(this.getHttpRoutes());
        this.ready = {
            isReady: false,
            lastUpdated: new Date(),
            // state: ProbeReadyStateText.WaitingRegisterService,
            service: {}
        };
        this.liveness = {
            isReady: false,
            lastUpdated: new Date(),
            service: {}
        };

        this.bus.on(ProbeReadyEvents.REGISTER_SERVICE, (serviceId: string) => {
            const newService:ProbeReadyServiceInfo = {
                isReady: false,
                lastUpdated: new Date(),
                state: [
                    'Service ' + serviceId + ' registered'
                ]
            };
            this.ready.service[serviceId] = newService;
        });
        this.bus.on(ProbeLivenessEvents.REGISTER_SERVICE, (serviceId: string) => {
            const newService:ProbeReadyServiceInfo = {
                isReady: false,
                lastUpdated: new Date(),
                state: [
                    'Service ' + serviceId + ' registered'
                ]
            };
            this.liveness.service[serviceId] = newService;
        });

        return Promise.resolve(this);
    }

    public run(): Promise<boolean | Probe> {
        // this.ready.state = ProbeReadyStateText.WaitingHealthService;
        this.bus.on(ProbeReadyEvents.UPDATE_SERVICE, (event: ProbeReadyServiceStatus) => {
            let service = this.ready.service[event.serviceId];
            if (typeof service === 'undefined') {
                Core.warn('Not found service in probe block', [event.serviceId]);
                return;
            }
            service.lastUpdated = new Date();
            service.isReady = event.isReady;
            service.state.push(event.state);
            this.ready.service[event.serviceId] = service;

            let isReady: boolean = true;
            Object.keys(this.ready.service).forEach(serviceId => {
                if (this.ready.service[serviceId].isReady === false) {
                    isReady = false;
                    return;
                }
            });
            this.ready.isReady = isReady;
        });

        this.bus.on(ProbeLivenessEvents.UPDATE_SERVICE, (event: ProbeLivenessServiceStatus) => {
            let service = this.liveness.service[event.serviceId];
            if (typeof service === 'undefined') {
                Core.warn('Not found service in probe block', [event.serviceId]);
                return;
            }
            service.lastUpdated = new Date();
            service.isReady = event.isReady;
            service.state.push(event.state);
            this.liveness.service[event.serviceId] = service;

            let isLiveness: boolean = true;
            Object.keys(this.liveness.service).forEach(serviceId => {
                if (this.liveness.service[serviceId].isReady === false) {
                    isLiveness = false;
                    return;
                }
            });
            this.liveness.isReady = isLiveness;
        });

        return Promise.resolve(this);
    }

    public getHttpRoutes(): Router {
        let router = require('koa-router')();
        return router
            .get('/probe/ready', this.getReadyStatus.bind(this))
            .get('/probe/liveness', this.getLivenessStatus.bind(this));

    }

    public getReadyStatus(ctx: Context): void {
        if (this.ready.isReady !== true) {
            ctx.status = 503;
            ctx.body = this.ready;
        } else {
            ctx.status = 200;
            ctx.body = this.ready;
        }
    }

    public getLivenessStatus(ctx: Context): void {
        if (this.liveness.isReady !== true) {
            ctx.status = 503;
            ctx.body = this.liveness;
        } else {
            ctx.status = 200;
            ctx.body = this.liveness;
        }
    }


}

declare enum ProbeReadyStateText {
    WaitingRegisterService = 'Waiting for register all components',
    WaitingHealthService = 'Waiting for boot all components',
    WorkNormal = 'All service booted',
}
interface ProbeReadyInterface {
    isReady: boolean;
    lastUpdated: Date;
    // state: ProbeReadyStateText;
    service: {
        [serviceId: string]: ProbeReadyServiceInfo
    };
}

interface ProbeReadyServiceInfo {
    isReady: boolean;
    lastUpdated: Date;
    state: string[];
}


export class ProbeReadyEvents {
    public static readonly REGISTER_SERVICE = 'Core.ProbeReady.REGISTER_SERVICE';
    public static readonly UPDATE_SERVICE = 'Core.ProbeReady.UPDATE_SERVICE';
}

export interface ProbeReadyServiceStatus {
    serviceId: string;
    isReady: boolean;
    state: string;
}

// ---------------------------------------------------
