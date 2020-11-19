import {KFDName} from "../../KFData/Format/KFDName";
import {Listener} from "./TypeEvent";


export class KFEvent
{
    public static ShareEvent:KFEvent = new KFEvent();

    public type:KFDName;
    ///[0]
    public arg:any;
    ///入栈的参数[1-n]，默认为空
    public stacks:any[];
    ///当前的事件对象
    public eventTarget:any;

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
    private _listenersMap :{[key:number]: {func:Listener<KFEvent>,target:any}[];} = {};
    private _fireType:KFDName;
    private _delayRemoves:Listener<KFEvent>[] = [];

    public Clear()
    {
        this._fireType = null;
        this._listenersMap = {};
        this._delayRemoves = [];
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
        if(this._fireType && this._fireType.value == type.value)
        {
            this._delayRemoves.push(listener);
            return;
        }

        let evtlist = this._listenersMap[type.value];
        if(evtlist)
        {
            let index = evtlist.length - 1;
            while(index >= 0)
            {
                if(evtlist[index].func == listener)
                {
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
            this._fireType = event.type;
            let count: number = listeners.length;
            for (let i = 0; i < count; i++)
            {
                let itm = listeners[i];
                itm.func.call(itm.target, event);
            }

            let removeType = this._fireType;
            this._fireType = null;

            if(this._delayRemoves.length > 0)
            {
                for(let listener of this._delayRemoves){
                    this.RemoveEventListener(removeType, listener);
                }
                this._delayRemoves.length = 0;
            }
        }
    }
}