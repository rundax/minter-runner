'use strict';

import {NodeApi} from './Modules/NodeApi';
import {Core} from '@Core/App';
import {loadEnvFile} from './Helpers/functions';
import {ConfigFactory} from '@Config/app-config';
import {Http} from '@Core/Http';
import {NodeConfigurator} from './Modules/NodeConfigurator';
import {NodeRunner} from './Modules/NodeRunner';
import {NodeCli} from './Modules/NodeCli';
import {Probe} from '@Core/Probe';
import {NodeSynced} from './Modules/NodeSynced';


const env = loadEnvFile(process.cwd() + '/.env.local');
if (env === false) {
    process.exit(1);
}

const configBase = ConfigFactory.getBase();
const configCore = ConfigFactory.getCore();
const configServices = ConfigFactory.getServices();

Core.bootstrap(configBase, configCore);

// -------------------Core modules-------------------

Core.app().registerService('http', new Http(configCore.http).init());
Core.app().registerService('probe', new Probe());

Core.app().getService<Probe>('probe').init();
// -------------------external modules-------------------

const nodeRunner = new NodeRunner(configServices.nodeRunner);
const nodeApi = new NodeApi(configServices.nodeApi);
const nodeConfigurator = new NodeConfigurator(configServices.configurator);
const nodeCli = new NodeCli(configServices.nodeRunner);
const nodeSynced = new NodeSynced();

Core.info('Init services');

Promise.all([
    nodeSynced.init(),
    nodeRunner.init(),
    nodeConfigurator.init(),
    nodeApi.init(),
    nodeCli.init()
])
    .then(() => {
        Core.info('System initialized');
        run();
    })
    .catch((error) => {
        Core.error('Can not init App:');
        throw error;
    });

function run() {
    Core.app().getService<Probe>('probe').run();

    Core.info('Run services');
    Promise.all([
        Core.app().getService<Http>('http').start(),
        nodeSynced.run(),
        nodeRunner.run(),
        nodeConfigurator.run(),
        nodeApi.run()
    ])
        .then(() => {
            Core.info('Base system started');
        })
        .catch((error: any) => {
            Core.error('Can not start App', error);
            process.exit(1);
        });
}


Core.app().setExitHandler((data: {code:string}) => {
    Core.info('Pcntl signal received. Closing connection server.', [data.code]);
    Promise.all([nodeRunner.stop()])
        .then(() => {
            Core.info('System gracefully stopped');
            process.exit(0);
        })
        .catch((error) => {
            Core.error('Can not stop services', error);
            process.exit(1);
        });
});
Core.app().subscribeOnProcessExit();
