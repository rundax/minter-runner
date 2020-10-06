import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import {Core} from '@Core/App';
import {BaseModule} from '@Core/BaseModule';
import {ProbeReadyEvents, ProbeReadyServiceStatus} from '@Core/Probe';
import {NodeRunnerEvents} from '../NodeRunner/Events';
import {ProbeLivenessEvents, ProbeLivenessServiceStatus} from '@Core/Probe/ProbeLiveness';
import {NodeCliEvents} from '../NodeCli/Events';

export class NodeSynced extends BaseModule<NodeSynced> {

    private readonly blockUpdateMs: 3000;
    private readonly blockTimeoutMs: 10000;

    private bus: EventBusInterface<SimpleEventBus>;
    private lastBlockHeight: number = 0;
    private isReadySend = false;
    private syncedTimer: NodeJS.Timeout;
    private syncedIsLiveness: boolean = true;

    public constructor(bus?: EventBusInterface<SimpleEventBus>) {
        super();
        this.bus = bus ?? Core.app().bus();

    }

    public init(): Promise<boolean | NodeSynced> {
        this.bus.emit(ProbeReadyEvents.REGISTER_SERVICE, 'NodeSynced');
        this.bus.emit(ProbeLivenessEvents.REGISTER_SERVICE, 'NodeSynced');
        return Promise.resolve(this);
    }

    public async run(): Promise<boolean | NodeSynced> {
        this.bus.on(NodeCliEvents.RES_NET_INFO, (result) => {
            const peers: any[] = result.peers;
            peers.forEach((value, index, array) => {
                if (value.latestBlockHeight > this.lastBlockHeight) {
                    this.lastBlockHeight = parseInt(value.latestBlockHeight);
                }
            }, this);
        });

        this.bus.emit(NodeCliEvents.GET_NET_INFO);
        this.bus.on(NodeRunnerEvents.NEW_BLOCK, (height: number) => {
            const diff: number = this.lastBlockHeight - height;
            if (diff < 10 && this.lastBlockHeight > 0 && this.isReadySend === false) {
                let readyProbeDone: ProbeReadyServiceStatus = {
                    serviceId: 'NodeSynced',
                    isReady: true,
                    state: 'Node synced successfully'
                };
                this.bus.emit(ProbeReadyEvents.UPDATE_SERVICE, readyProbeDone);
                let readyLivenessDone: ProbeLivenessServiceStatus = {
                    serviceId: 'NodeSynced',
                    isReady: true,
                    state: 'Node synced successfully'
                };
                this.bus.emit(ProbeLivenessEvents.UPDATE_SERVICE, readyLivenessDone);
                this.isReadySend = true;
                this.setIsSyncedLiveProbe();
            }
        });

        setInterval(() => {
            this.bus.emit(NodeCliEvents.GET_NET_INFO);
        }, 10000);

        return Promise.resolve(this);
    }

    private setIsSyncedLiveProbe() {
        this.bus.on(NodeRunnerEvents.NEW_BLOCK, (height: number) => {
            if (this.syncedIsLiveness === false) {
                let livnessProbeDone: ProbeLivenessServiceStatus = {
                    serviceId: 'NodeSynced',
                    isReady: true,
                    state: 'Node synced'
                };
                this.bus.emit(ProbeLivenessEvents.UPDATE_SERVICE, livnessProbeDone);
                this.syncedIsLiveness = true;
            }

            clearInterval(this.syncedTimer);
            this.syncedTimer = setTimeout(this.sendNodeUnstableStatus.bind(this), 7000);
        });
    }

    private sendNodeUnstableStatus() {
        if (this.syncedIsLiveness === true) {
            let livnessProbeDone: ProbeLivenessServiceStatus = {
                serviceId: 'NodeSynced',
                isReady: false,
                state: 'New block did not arrive within 10 seconds'
            };
            this.bus.emit(ProbeLivenessEvents.UPDATE_SERVICE, livnessProbeDone);
            this.syncedIsLiveness = false;
        }
    }

}
