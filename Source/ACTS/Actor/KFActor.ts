import {IKFBlockTargetContainer, KFBlockTarget, KFGraphTarget} from "../Context/KFBlockTarget";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFActorModel} from "./Model/KFActorModel";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFTimers} from "../Context/KFTimers";
import {KFComponentBase} from "./Components/KFComponentBase";
import {KFAsyncComponent} from "./Components/KFAsyncComponent";
import {KFTimelineComponent} from "./Components/KFTimelineComponent";
import {KFGraphComponent} from "./Components/KFGraphComponent";
import {KFScriptComponent} from "./Components/KFScriptComponent";
import {KFGlobalDefines} from "../KFACTSDefines";


export class KFActor extends KFGraphTarget implements IKFBlockTargetContainer
{
    public runtime:IKFRuntime;
    public model:KFActorModel;
    public path:string;
    public etable:KFEventTable;
    public timers:KFTimers;
    public async:KFAsyncComponent;
    public timeline:KFTimelineComponent;
    public graph:KFGraphComponent;
    public script:KFScriptComponent;

    protected m_cfg:any;///KFActorConfig
    protected m_mapComponents:{[key: number]: KFComponentBase;} = {};
    protected m_listComponents:Array<KFComponentBase> = new Array<KFComponentBase>();
    protected m_children:Array<KFBlockTarget> = new Array<KFBlockTarget>();

    public constructor(runtime:IKFRuntime = null)
    {
        super();
        this.bttype = KFBlockTarget.BTAll;
        this.runtime = runtime;
    }

    public Construct(metadata:any
        , runtime:IKFRuntime)
    {
        super.Construct(metadata,runtime);
        this.runtime = runtime;
        this.Init(this.metadata.asseturl);
    }

    public Init(asseturl:string):void
    {
        this.path = asseturl;
        this.model = this.CreateModel();
        this.m_cfg = this.LoadConfig(asseturl);

        if(this.m_cfg)
        {
            this.name = this.m_cfg.name;
            this.model.SetConfig(this.m_cfg);
            this.model.actived = false;
            this.InitAllComponent();
        }
    }

    public InitAllComponent():void
    {
        this.timeline = this.AddComponent(KFTimelineComponent);
        this.script = this.AddComponent(KFScriptComponent);
        this.graph = this.AddComponent(KFGraphComponent);
        this.async = this.AddComponent(KFAsyncComponent);
    }

    public AddComponent(cls:any):any
    {
        let type:number = cls.Meta.value;///KFDName
        let p:KFComponentBase = new cls(this, type);
        this.m_listComponents.push(p);
        this.m_mapComponents[type] = p;
        return p;
    }

    public GetComponent(type:number):KFComponentBase
    {return this.m_mapComponents[type];}

    public ResetAllComponent():void
    {
        let cnt = this.m_listComponents.length;
        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].ResetComponent();
        }
    }

    public ActivateAllComponent():void
    {
        let cnt = this.m_listComponents.length;
        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].ActivateComponent();
        }
    }

    public DeactiveAllComponent():void
    {
        let cnt = this.m_listComponents.length;
        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].DeactiveComponent();
        }
    }

    public Reset():void
    {
        this.model.Reset();
        this.m_cfg = this.LoadConfig(this.path);
        if(this.m_cfg)
        {
            this.name = this.m_cfg.name;
            this.model.SetConfig(this.m_cfg);
            this.model.actived = false;
        }
        this.ResetAllComponent();
    }

    public ActivateACT(sid:number):void
    {
        this.timers = new KFTimers(this.runtime);
        this.etable = new KFEventTable();
        this.model.Activate(sid,this.etable);
        this.sid = sid;
        this.ActivateAllComponent();
    }

    public Deactive():void
    {
        this.DeactiveAllComponent();
        this.model.Deactive();
        this.timers = null;
        this.etable = null;
    }

    public ActivateBLK(KFTimeBlockData:any):void
    {
        this.ActivateACT(0);
    }

    public DeactiveBLK(KFTimeBlockData:any):void
    {
        this.Deactive();
    }

    public ActivateGraph(KFGraphBlockData:any):void
    {
        this.ActivateACT(0);
    }

    public DeactiveGraph(KFGraphBlockData:any):void
    {
        this.Deactive();
    }

    //public IsActived():boolean{}

    public Tick(frameindex:number):void
    {
        if (!this.model.actived)
        {
            return;
        }

        if (this.model.pause)
        {
            return;
        }

        let freezetimeMS:number = this.model.freezetime;
        if (freezetimeMS > 0)
        {
            freezetimeMS -= KFGlobalDefines.TPF;
            if (freezetimeMS <= 0)
            {
                freezetimeMS = 0;
                ///在播放中或不在冻结中则继续
                if (!this.model.pause)
                {
                    this.timeline.SetFreeze(false);
                }
            }
            else
            {
                this.timeline.SetFreeze(true);
            }

            this.model.freezetime = freezetimeMS;
            return;
        }
        ///
        this.async.PreEnterFrame();

        if(this.timers) this.timers.Tick();

        let cnt = this.m_listComponents.length;
        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].EnterFrame();
        }
        this.async.LateEnterFrame();
    }

    public TickInEditor(frameindex:number):void
    {}

    public AddChild(child: KFBlockTarget): void
    {
        let p = child.parent;
        if(p != this)
        {
            if(p != null)
                p.RemoveChild(child);
            this.m_children.push(child);
            child.parent = this;
        }
    }

    public FindChild(name: string): KFBlockTarget
    {
        let i:number = this.m_children.length -1;
        while (i >= 0)
        {
            let child:KFBlockTarget = this.m_children[i];
            if(child.name == name)
                return child;
            i -= 1;
        }
        return null;
    }

    public GetChild(index: number): KFBlockTarget
    {
        if(index >= this.m_children.length)
            return null;
        return this.m_children[index];
    }

    public RemoveChild(child: KFBlockTarget): void
    {
        if(child.parent == this)
        {
            let i = this.m_children.length - 1;
            while (i >= 0)
            {
                if(this.m_children[i] == child)
                {
                    this.m_children.splice(i,1);
                    break;
                }
                i -= 1;
            }
            child.parent = null;
        }
    }

    /// KFActorConfig
    protected LoadConfig(path:string):any
    {
        return this.runtime.configs.GetActorConfig(path,false);
    }

    protected CreateModel():KFActorModel
    {
        return new KFActorModel();
    }
}