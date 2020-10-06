export interface NodeProcessConfig {
    runNode: boolean;
    home: string;
    binFilePath: string;
    configFolder: string;
    logsToStdout: boolean;
    blockNotify: boolean;
    is_testnet: boolean;
}

export interface NodeLogFormat {
    _msg: string;
    level: 'info' | 'error'| 'debug';
    module: ModuleName;
    impl?: string;
    connection?: string;
    /**
     * BlockHash
     */
    hash?: string;

    /**
     * block height
     */
    height?: number;
    nodeInfo?: {
        id: string,
        listen_addr: string,
        network: string,
        version: string,
        channels: string,
        moniker: string,
        protocol_version: {
            p2p: number,
            block: number,
            app: number
        }
        other: object

    };
    addr?: string;
    peer?: string;
    pubKey?: string;
    conn?: string;
    listen_addr?: string;

}

export enum ModuleName {
    'proxy',
    'abci-client',
    'consensus',
    'tendermint',
    'events',
    'p2p',
    'pex',
    'mempool',
    'rpc-server',
    'txindex',
    'evidence',
}



export interface NodeAddressBookInterface {
    key: string;
    addrs: AddressBookItemInterface[];
}


interface AddressBookItemInterface {
    addr: {
        id: string,
        ip: string,
        port: number
    };
    src: {
        id: string,
        ip: string,
        port: number
    };
    attempts: number;
    last_attempt: Date;
    last_success: Date;
    bucket_type: number;
    buckets: any; // todo
}
