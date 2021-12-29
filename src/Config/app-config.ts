import {env, envBoolean, envNumber} from '../Helpers/functions';
import {NodeApiConfigInterface} from '../Modules/NodeApi/Interfaces/NodeConfigInterface';
import {NodeProcessConfig} from '../Modules/NodeRunner/interfaces';
import * as path from 'path';
import {ConsoleTarget} from '@elementary-lab/logger/src/Targets/ConsoleTarget';
import {SentryTarget} from '@elementary-lab/logger/src/Targets/SentryTarget';
import {LogLevel} from '@elementary-lab/logger/src/Types';
import {AppInfo, CoreConfigInterface} from '@Core/App';
import {ConfigFileInterface} from '../Modules/NodeConfigurator';
import {NodeStatusPageConfig} from '../Modules/NodeStatusPage';

export class ConfigFactory {

    public static getBase(): AppInfo {
        return {
            id: 'minter-node-runner',
            version: env('APP_VERSION'),
            environment: env('APP_ENV'),
        };
    }


    public static getCore(): CoreConfigInterface {
        return {
            log: {
                flushInterval: 1,
                traceLevel: 3,
                targets: [
                    new ConsoleTarget({
                        enabled: true,
                        levels: [ LogLevel.INFO, LogLevel.ERROR, LogLevel.NOTICE, LogLevel.DEBUG, LogLevel.WARNING, LogLevel.EMERGENCY]
                    }),
                    new SentryTarget({
                        enabled: envBoolean('APP_SENTRY_ENABLED', false),
                        dsn: env('APP_SENTRY_DSN', 'https://fake@fake.local/123'),
                        release: ConfigFactory.getBase().version,
                        environment: ConfigFactory.getBase().environment,
                        levels: [LogLevel.ERROR, LogLevel.WARNING]
                    })
                ]
            },
            http: {
                host: '*',
                port: 3000,
                timeout: 300
            }
        };
    }


    public static getServices(): ServicesConfigInterface {
        return {
            nodeApi: {
                debugProxy: {
                    active: envBoolean('APP_NODE_API_DEBUG_PROXY', false),
                    host: env('APP_NODE_API_DEBUG_PROXY_HOST', '127.0.0.1'),
                    port: envNumber('APP_NODE_API_DEBUG_PROXY_PORT', 9000, 10)
                }
            },
            nodeRunner: {
                runNode: envBoolean('APP_BLOCKCHAIN_RUN_NODE', false),
                home: env('APP_BLOCKCHAIN_HOME', path.resolve(process.cwd(), './blockchain') + '/'),
                binFilePath: env('APP_BLOCKCHAIN_BIN_FILE_PATH', path.resolve(process.cwd(), './bin') + '/minter'),
                configFolder: env('APP_BLOCKCHAIN_CONFIG_DIR', path.resolve(process.cwd(), './config') + '/'),
                logsToStdout: envBoolean('APP_BLOCKCHAIN_LOGS_TO_STDOUT', true),
                blockNotify: envBoolean('APP_BLOCKCHAIN_NOTIFY_NEW_BLOCK', true),
                is_testnet: envBoolean('APP_BLOCKCHAIN_IS_TESTNET', false),
            },
            configurator: {
                configFileDir: env('APP_BLOCKCHAIN_CONFIG_DIR', '/app/'),
                genesisFileLink: env('APP_BLOCKCHAIN_GENESIS_FILE_LINK', ''),
                toml: {
                    general: {
                        halt_height: envNumber('APP_CONFIGURATOR_GENERAL_HALT_HEIGHT', 0, 1),
                        moniker: env('APP_CONFIGURATOR_GENERAL_MONIKER', 'rundax-minter-runner'),
                        api_listen_addr: env('APP_CONFIGURATOR_GENERAL_API_LISTEN_ADDR', 'tcp://0.0.0.0:8841'),
                        grpc_listen_addr: env('APP_CONFIGURATOR_GENERAL_GRPC_LISTEN_ADDR', 'tcp://0.0.0.0:8842'),
                        api_v2_listen_addr: env('APP_CONFIGURATOR_GENERAL_API_V2_LISTEN_ADDR', 'tcp://0.0.0.0:8843'),
                        validator_mode: envBoolean('APP_CONFIGURATOR_GENERAL_VALIDATOR_MODE', false),
                        keep_last_states: envNumber('APP_CONFIGURATOR_GENERAL_KEEP_LAST_STATES', 120, 3),
                        state_cache_size: envNumber('APP_CONFIGURATOR_GENERAL_STATE_CACHE_SIZE', 1000000, 7),
                        state_mem_available: envNumber('APP_CONFIGURATOR_GENERAL_STATE_MEM_AVAILABLE', 1024, 7),
                        api_simultaneous_requests: envNumber('APP_CONFIGURATOR_GENERAL_API_SIMULTANEOUS_REQUESTS', 100, 2),
                        fast_sync: envBoolean('APP_CONFIGURATOR_GENERAL_FAST_SYNC', true),
                        db_backend: env('APP_CONFIGURATOR_GENERAL_DB_BACKEND', 'goleveldb'),
                        db_path: env('APP_CONFIGURATOR_GENERAL_DB_PATH', 'tmdata'),
                        log_level: env('APP_CONFIGURATOR_GENERAL_LOG_LEVEL', 'consensus:info,main:info,state:info,*:error'),
                        log_format: env('APP_CONFIGURATOR_GENERAL_LOG_FORMAT', 'json'),
                        log_path: env('APP_CONFIGURATOR_GENERAL_LOG_PATH', 'stdout'),
                        prof_laddr: env('APP_CONFIGURATOR_GENERAL_PROF_LADDR', ''),
                    },
                    rpc: {
                        laddr: env('APP_CONFIGURATOR_RPC_LADDR', 'tcp://127.0.0.1:26657'),
                        grpc_laddr: env('APP_CONFIGURATOR_RPC_GRPC_LADDR', ''),
                        grpc_max_open_connections: envNumber('APP_CONFIGURATOR_RPC_GRPC_MAX_OPEN_CONNECTIONS', 900, 3),
                        unsafe: envBoolean('APP_CONFIGURATOR_RPC_UNSAFE', false),
                        max_open_connections: envNumber('APP_CONFIGURATOR_RPC_MAX_OPEN_CONNECTIONS', 900, 3),
                    },
                    p2p: {
                        laddr: env('APP_CONFIGURATOR_P2P_LADDR', 'tcp://0.0.0.0:26656'),
                        external_address: env('APP_CONFIGURATOR_P2P_external_address', ''),
                        seeds: env('APP_CONFIGURATOR_P2P_SEEDS', ''),
                        persistent_peers: env('APP_CONFIGURATOR_P2P_PERSISTENT_PEERS', ''),
                        upnp: envBoolean('APP_CONFIGURATOR_P2P_UPNP', false),
                        addr_book_strict: envBoolean('APP_CONFIGURATOR_P2P_ADDR_BOOK_STRICT', true),
                        flush_throttle_timeout: env('APP_CONFIGURATOR_P2P_FLUSH_THROTTLE_TIMEOUT', '10ms'),
                        max_num_inbound_peers: envNumber('APP_CONFIGURATOR_P2P_MAX_NUM_INBOUND_PEERS', 40, 2),
                        max_num_outbound_peers: envNumber('APP_CONFIGURATOR_P2P_MAX_NUM_OUTBOUND_PEERS', 10, 2),
                        max_packet_msg_payload_size: envNumber('APP_CONFIGURATOR_P2P_MAX_PACKET_MSG_PAYLOAD_SIZE', 1024, 2),
                        send_rate: envNumber('APP_CONFIGURATOR_P2P_SEND_RATE', 15360000, 2),
                        recv_rate: envNumber('APP_CONFIGURATOR_P2P_RECV_RATE', 15360000, 2),
                        pex: envBoolean('APP_CONFIGURATOR_P2P_PEX', true),
                        seed_mode: envBoolean('APP_CONFIGURATOR_P2P_SEED_MODE', false),
                        private_peer_ids: env('APP_CONFIGURATOR_P2P_PRIVATE_PEER_IDS', ''),
                    },
                    mempool: {
                        broadcast: envBoolean('APP_CONFIGURATOR_MEMPOOL_BROADCAST', true),
                        wal_dir: env('APP_CONFIGURATOR_MEMPOOL_WAL_DIR', ''),
                        size: envNumber('APP_CONFIGURATOR_MEMPOOL_SIZE', 10000, 2),
                        cache_size: envNumber('APP_CONFIGURATOR_MEMPOOL_CACHE_SIZE', 100000, 2),
                    },
                    instrumentation: {
                        prometheus: envBoolean('APP_CONFIGURATOR_INSTRUMENTATION_PROMETHEUS', false),
                        prometheus_listen_addr: env('APP_CONFIGURATOR_INSTRUMENTATION_PROMETHEUS_LISTEN_ADDR', ':26660'),
                        max_open_connections: envNumber('APP_CONFIGURATOR_INSTRUMENTATION_MAX_OPEN_CONNECTIONS', 3, 2),
                        namespace: env('APP_CONFIGURATOR_INSTRUMENTATION_NAMESPACE', 'minter'),
                    }
                }
            },
            statusPage: {
                enabled: envBoolean('APP_STATUS_PAGE_ENABLED', false),
                generalApiUrl: env('APP_STATUS_PAGE_GENERAL_API_URL', ''),
            }
        };
    }
}

interface ServicesConfigInterface {
    nodeApi: NodeApiConfigInterface;
    nodeRunner: NodeProcessConfig;
    configurator: ConfigFileInterface;
    statusPage: NodeStatusPageConfig;
}
