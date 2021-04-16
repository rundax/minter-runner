export interface TomlGeneralConfigInterface {
    halt_height: number;
    moniker: string;
    api_listen_addr: string;
    grpc_listen_addr: string;
    api_v2_listen_addr: string;
    validator_mode: boolean;
    keep_last_states: number;
    state_cache_size: number;
    state_mem_available: number;
    api_simultaneous_requests: number;
    fast_sync:boolean;
    db_backend: string;
    db_path: string;
    log_level: string;
    log_format: string;
    log_path: string;
    prof_laddr: string;
}

export interface TomlRPCConfigInterface {
    laddr: string;
    grpc_laddr: string;
    grpc_max_open_connections: number;
    unsafe: boolean;
    max_open_connections: number;
}

export interface TomlP2PConfigInterface {
    laddr: string;
    external_address: string;
    seeds: string;
    persistent_peers: string;
    upnp: boolean;
    addr_book_strict: boolean;
    flush_throttle_timeout: string;
    max_num_inbound_peers: number;
    max_num_outbound_peers: number;
    max_packet_msg_payload_size: number;
    send_rate: number;
    recv_rate: number;
    pex: boolean;
    seed_mode: boolean;
    private_peer_ids: string;
}

export interface TomlMemPoolConfigInterface {
    broadcast: boolean;
    wal_dir: string;
    size: number;
    cache_size: number;
}

export interface TomlInstrumentationConfigInterface {
    prometheus: boolean;
    prometheus_listen_addr: string;
    max_open_connections: number;
    namespace: string;
}


