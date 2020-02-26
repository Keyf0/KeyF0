import {KFDName} from "../../KFData/Format/KFDName";
import {Listener} from "./TypeEvent";


export class KFEvent
{
    public type:KFDName;
    public arg:any;

    public constructor(evtname:KFDName = null)
    {
        this.type = new KFDName();
        this.type.value = evtname == null ? 0 : evtname.value;
    }
}

export class KFEventTable
{
    private _listenersMap :{[key:number]: Listener<KFEvent>[];} = {}

    public AddEventListener(type:KFDName, listener:Listener<KFEvent>)
    {
        let evtlist = this._listenersMap[type.value];
        if(!evtlist)
        {
            evtlist = [];
            this._listenersMap[type.value] = evtlist;
        }

        evtlist.push(listener);
    }

    public RemoveEventListener(type:KFDName, listener:Listener<KFEvent>)
    {
        let evtlist = this._listenersMap[type.value];
        if(evtlist)
        {
            let index = evtlist.indexOf(listener);
            if(index != -1)
            {
                evtlist.splice(index,1);
            }
        }
    }

    public FireEvent(event:KFEvent):void
    {
        let listeners = this._listenersMap[event.type.value];
        if(listeners)
        {
            let count: number = listeners.length;
            for (let i = 0; i < count; i++)
            {
                listeners[i](event);
            }
        }
    }
}