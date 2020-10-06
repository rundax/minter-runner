'use strict';


import {ModuleName, NodeLogFormat} from './interfaces';


export interface ModelFieldsObject {
    [key: string]: string;
}


export class LogsFormatter {

    private additionalData;

    /**
     *
     * @param data
     */
    public process(data: NodeLogFormat): object {
        this.additionalData = data;

        delete this.additionalData._msg;
        delete this.additionalData.level;
        delete this.additionalData.module;
        let tags = {};
        return {};
        switch (data.module) {
            // case ModuleName.consensus:
            //     return this.formatterConsensus();
            // case ModuleName.events:
            //     return this.formatterEvents();
            // case ModuleName.evidence:
            //     return this.formatterEvidence();
            // case ModuleName.mempool:
            //     return this.formattermMmpool();
            // case ModuleName.p2p:
            //     return this.formatterP2p();
            // case ModuleName.pex:
            //     return this.formatterPex();
            // case ModuleName.proxy:
            //     return this.formatterProxy();
            // case ModuleName.tendermint:
            //     return this.formatterTendermint();
            // case ModuleName.txindex:
            //     return this.formattermTxIndex();
            // case ModuleName["abci-client"]:
            //     return this.formatterAbciClient();
            // case ModuleName["rpc-server"]:
            //     return this.formattermRpcServer();
            default:
                tags = this.formatterDefault();

        }
    }

    private formatterDefault() {
        return '';
    }

    private formatterProxy(): object {
        return {};
    }

    private formatterAbciClient(): object {
        return {};
    }

    private formatterConsensus(): object {
        return {};
    }

    private formatterTendermint(): object {
        return {};
    }

    private formatterEvents(): object {
        return {};
    }

    private formatterP2p(): object {
        return {};
    }

    private formatterPex(): object {
        return {};
    }

    private formattermMmpool(): object {
        return {};
    }

    private formattermRpcServer(): object {
        return {};
    }

    private formattermTxIndex(): object {
        return {};
    }

    private formatterEvidence(): object {
        return {};
    }

}