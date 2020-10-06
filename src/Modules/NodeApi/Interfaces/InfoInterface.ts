export interface StatusInterface {
    version: string;
    latest_block_hash: string;
    latest_app_hash: string;
    latest_block_height: number;
    latest_block_time: string;
    tm_status: TendermintStatus;
}
interface TendermintStatus {
    node_info:NodeInfo;
    sync_info: SyncInfo;
    validator_info: ValidatorInfo;
}
interface NodeInfo {
    id: string;
    network: string;
    listen_addr: string;
    version:string;
    channels: number;
    moniker: string;
    other: {
        tx_index:string
        rpc_address: string
    };
    protocol_version: {
        'p2p': number,
        'block': number,
        'app': number
    };
}
interface SyncInfo {
    latest_block_hash: string;
    latest_app_hash: string;
    latest_block_height: number;
    latest_block_time: string;
    catching_up: boolean;
}
interface ValidatorInfo {
    address: string;
    pub_key: {
        type: string;
        value: string;
    };
    voting_power: number;
}


export interface NetInfoInterface {
    listening: boolean;
    listeners: string[];
    n_peers: string;
    peers: PearItem[];
}
interface PearItem {
    is_outbound: boolean;
    remote_ip: string;
    node_info: NodeInfo;
    connection_status: {
        Duration: string,
        SendMonitor: MonitorItem,
        RecvMonitor: MonitorItem,
        Channels: ChannelItem[]
    };
}
interface MonitorItem {
    Active: true;
    Start: Date;
    Duration: string;
    Idle: string;
    Bytes: string;
    Samples: string;
    InstRate: string;
    CurRate: string;
    AvgRate: string;
    PeakRate: string;
    BytesRem: string;
    TimeRem: string;
    Progress: number;
}
interface ChannelItem {
    ID: number;
    SendQueueCapacity: string;
    SendQueueSize: string;
    Priority: string;
    RecentlySent: string;
}

export interface CandidateInterface {
    reward_address: string;
    owner_address: string;
    total_stake: string;
    pub_key: string;
    commission: string;
    created_at_block: string;
    status: number;
    stakes: StakeItem[];
}

interface StakeItem {
    owner: string;
    coin: string;
    value: string;
    bip_value: string;
}

export interface ValidatorItemInterface {
    pub_key: string;
    voting_power: string;
}


export interface BlockInfoInterface {
    hash: string;
    height: string;
    time: string;
    num_txs: string;
    total_txs: string;
    block_reward: string;
    size: string;
    proposer: string;
    transactions: TransactionItem[];
    validators: {pub_key: string, signed:boolean}[];
}

interface TransactionItem {
    hash: string;
    raw_tx: string;
    from: string;
    nonce: string;
    block_reward: string;
    size: number;
    proposer: string;
    gas_price: number;
    type:number;
    payload: string;
    service_data: string;
    gas: string;
    gas_coin: string;
    data: {
        pub_key: string,
        coin: string,
        value: string,
    };
    tags: {
        'tx.type': string
        'tx.from': string
    };
}
