import {EventBusInterface} from '@elementary-lab/standards/src/EventBusInterface';
import {SimpleEventBus} from '@elementary-lab/events/src/SimpleEventBus';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as url from 'url';
import * as client from 'follow-redirects';
import * as http from 'http';
import {
    TomlGeneralConfigInterface, TomlInstrumentationConfigInterface,
    TomlMemPoolConfigInterface,
    TomlP2PConfigInterface,
    TomlRPCConfigInterface
} from './Interfaces';
import {Core} from '@Core/App';
import {BaseModule} from '@Core/BaseModule';
import {Error, FatalError} from 'tslint/lib/error';

export class NodeConfigurator extends BaseModule<NodeConfigurator> {

    public CONFIG_TOML_FILE = 'config.toml';
    public CONFIG_ADDRBOOK = 'addrbook.json';
    public CONFIG_NODE_KEY = 'node_key.json';
    public CONFIG_PRIV_VALIDATOR = 'priv_validator.json';
    public CONFIG_PRIV_VALIDATOR_STATE = 'priv_validator_state.json';

    private bus: EventBusInterface<SimpleEventBus>;
    private config: ConfigFileInterface;

    public constructor(config: ConfigFileInterface) {
        super();
        this.config = config;
        this.bus = Core.app().bus();
    }

    public async init(): Promise<NodeConfigurator> {
        if (!fs.existsSync(this.config.configFileDir)) {
            fs.mkdirSync(this.config.configFileDir);
        }
        await this.checkGenesis();
        await this.createTomlConfig();
        return Promise.resolve(this);
    }

    public run(): Promise<boolean | NodeConfigurator> {
        // TODO add address book listener
        return Promise.resolve(this);
    }

    public async createTomlConfig() {
        return new Promise<any>((resolve, reject) => {
            Core.info('Create config.toml file', null, 'configurator');
            let content = require('./config_toml.hbs')(this.config.toml);
            Handlebars.compile(require('./config_toml.hbs')().toString());
            fs.writeFileSync(this.config.configFileDir + 'config.toml', content, {
                encoding: 'utf8',
                flag: 'w+',
                mode: 0o600
            });
            resolve();
            // /* develblock:start */
            // require.extensions['.hbs'] = (module, filename) => {
            //     module.exports = fs.readFileSync(filename, 'utf8');
            // };
            // /* develblock:end */
            //
            // const contents = require('./config_toml.hbs');
            // const template = Handlebars.compile(contents);
            //
            // let fileWriteOptions: fs.WriteFileOptions = {
            //     encoding: 'utf8',
            //     flag: 'w+',
            //     mode: 0o600
            // };

            // fs.writeFile(
            //     this.config.configFileDir + 'config.toml',
            //     template(this.config.toml),
            //     fileWriteOptions,
            //     (err: NodeJS.ErrnoException) => {
            //         if (err) {
            //             reject(err);
            //         } else {
            //             resolve();
            //         }
            //     });
        });

    }

    public async checkGenesis() {
        return new Promise<any>((resolve, reject) => {
            const downloadGenesisFilePath =  this.config.configFileDir + 'genesis.json';
            fs.access(downloadGenesisFilePath, fs.constants.R_OK, (err: any) => {
                if (!err) {
                    NodeConfigurator.checkGenesisVersion(downloadGenesisFilePath).then(() => {
                        resolve();
                    });
                } else {
                    Core.info('Download genesis file', this.config.genesisFileLink, 'configurator');
                    let options = url.parse(this.config.genesisFileLink);
                    client.https.get(options, function (response: http.IncomingMessage) {
                        if (response.statusCode !== 200) {
                            reject();
                        }
                        let file = fs.createWriteStream(downloadGenesisFilePath);
                        response.pipe(file);
                        file.on('finish', () => {
                            file.close();  // close() is async, call cb after close completes.
                            file.on('close', () => {
                                Core.info('New genesis file writed:', null, 'configurator');
                                NodeConfigurator.checkGenesisVersion(downloadGenesisFilePath).then(() => {
                                    resolve();
                                });
                            });
                        });
                    }).on('error', function (err) { // Handle errors
                        Core.error('Can not download genesis file:', [err.message], 'configurator');
                        reject();
                    });
                }
            });
        });
    }

    public static async checkGenesisVersion(fileLink: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(fileLink, (err, data) => {
                if (err) throw err;
                if (data.toString() === '') {
                    throw new FatalError('Genesis file is empty');
                }
                let genesis = JSON.parse(data.toString());
                Core.info('Use Genesis:', genesis.chain_id, 'configurator');
                resolve();
            });
        });
    }
}

export interface ConfigFileInterface {
    configFileDir: string;
    genesisFileLink: string;
    toml: {
        general: TomlGeneralConfigInterface;
        rpc: TomlRPCConfigInterface;
        p2p: TomlP2PConfigInterface;
        mempool: TomlMemPoolConfigInterface;
        instrumentation: TomlInstrumentationConfigInterface;
    };

}
