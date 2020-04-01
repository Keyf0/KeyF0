import {KFDName} from "../../KFData/Format/KFDName";
import {Listener} from "./TypeEvent";


export class KFEvent
{
    public type:KFDName;
    public arg:any;

    ///evtname:KFDName|number|string
    public constructor(evtname:any = null)
    {
        this.type = new KFDName();
        let typstr = typeof(evtname);

        if(typstr == 'string') {
            this.type.value =  KFDName._Strs.GetNameID(evtname);
        }else if(typstr == "number"){
            this.type.value = evtname;
        }
        else
            this.type.value = evtname == null ? 0 : evtname.value;
    }

}

export class KFEventTable
{
    private _listenersMap :{[key:number]: {func:Listener<KFEvent>,target:any}[];} = {}

    public Clear(){
        this._listenersMap = {};
    }

    public AddEventListener(type:KFDName, listener:Listener<KFEvent>,target:any = null)
    {
        let evtlist = this._listenersMap[type.value];
        if(!evtlist)
        {
            evtlist = [];
            this._listenersMap[type.value] = evtlist;
        }

        evtlist.push({func:listener,target:target});
    }

    public RemoveEventListener(type:KFDName, listener:Listener<KFEvent>)
    {
        let evtlist = this._listenersMap[type.value];
        if(evtlist)
        {
            let index = evtlist.length - 1;
            while(index >= 0)
            {
                if(evtlist[index].func == listener) {

                    evtlist.splice(index, 1);
                    break;
                }
                index -= 1;
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
                let itm = listeners[i];
                itm.func.call(itm.target,event);
            }
        }
    }
}