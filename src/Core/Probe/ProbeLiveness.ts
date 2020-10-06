export interface ProbeLivenessInterface {
    isReady: boolean;
    lastUpdated: Date;
    // state: ProbeLivenessStateText;
    service: {
        [serviceId: string]: ProbeLivenessServiceInfo
    };
}

export interface ProbeLivenessServiceInfo {
    isReady: boolean;
    lastUpdated: Date;
    state: string[];
}


export class ProbeLivenessEvents {
    public static readonly REGISTER_SERVICE = 'Core.ProbeLiveness.REGISTER_SERVICE';
    public static readonly UPDATE_SERVICE = 'Core.ProbeLiveness.UPDATE_SERVICE';
}

export interface ProbeLivenessServiceStatus {
    serviceId: string;
    isReady: boolean;
    state: string;
}
