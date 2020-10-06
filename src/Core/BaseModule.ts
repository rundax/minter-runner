export abstract class BaseModule<T> {
    abstract init(): Promise<T | boolean>;
    abstract run(): Promise<T | boolean >;
}
