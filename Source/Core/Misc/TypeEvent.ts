export interface Listener<T>
{
    (event: T): any;
}

export interface Disposable
{
    dispose(): any;
}

export class TypeEvent<T>
{
    private listeners: Listener<T>[] = [];
    private listenersOncer: Listener<T>[] = [];

    public on = (listener: Listener<T>): Disposable => {
        this.listeners.push(listener);

        return {
            dispose: () => this.off(listener)
        };
    };

    public once = (listener: Listener<T>): void => {
        this.listenersOncer.push(listener);
    };

    public off = (listener: Listener<T>) => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    };

    public emit = (event: T) => {

        let count:number = this.listeners.length;
        for(let i = 0;i < count ;i ++)
        {
            this.listeners[i](event);
        }
        count = this.listenersOncer.length;

        for(let i = 0;i < count ;i ++)
        {
            this.listenersOncer[i](event);
        }

        this.listenersOncer = [];
    };

    public pipe = (te: TypeEvent<T>): Disposable => {
        return this.on(e => te.emit(e));
    };
}