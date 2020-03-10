import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFComponentBase} from "./Components/KFComponentBase";
import {KFTimelineComponent} from "./Components/KFTimelineComponent";
import {KFGraphComponent} from "./Components/KFGraphComponent";
import {KFScriptComponent} from "./Components/KFScriptComponent";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";


export class KFActor extends KFBlockTarget implements IKFBlockTargetContainer
{
    public static Meta:IKFMeta = new IKFMeta("KFActor"

    ,():KFBlockTarget=>{
        return new KFActor();
    }
);

    //public model:KFActorModel;
    public pause:boolean  = false;
    public timeline:KFTimelineComponent;
    public graph:KFGraphComponent;
    public script:KFScriptComponent;

    protected m_mapComponents:{[key: number]: KFComponentBase;} = {};
    protected m_listComponents:Array<KFComponentBase> = new Array<KFComponentBase>();
    protected m_children:Array<KFBlockTarget> = new Array<KFBlockTarget>();

    public constructor() {super();}

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        super.Construct(metadata,runtime);
        this.Init(this.metadata.asseturl);
    }

    public Init(asseturl:string):void
    {
        if(this.timeline == null)
        {
            this.InitAllComponent();
        }
    }

    public InitAllComponent():void
    {
        this.timeline = this.AddComponent(KFTimelineComponent);
        this.script = this.AddComponent(KFScriptComponent);
        this.graph = this.AddComponent(KFGraphComponent);
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
        this.ResetAllComponent();
    }

    public ActivateACT(sid:number):void
    {
        this.etable = new KFEventTable();
        this.ActivateAllComponent();
    }

    public Deactive():void
    {
        this.DeactiveAllComponent();
        this.etable = null;
    }

    public ActivateBLK(KFBlockTargetData:any):void
    {
        super.ActivateBLK(KFBlockTargetData);
        this.ActivateACT(this.sid);
    }

    public DeactiveBLK(KFBlockTargetData:any):void
    {
        this.Deactive();
    }
    //public IsActived():boolean{}

    public Tick(frameindex:number):void
    {
        if (this.pause) {return;}
        this.TickComponents(frameindex);
    }

    public TickComponents(frameindex:number):void
    {
        let cnt = this.m_listComponents.length;
        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].PreEnterFrame();
        }

        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].EnterFrame();
        }

        for (let i = 0; i < cnt; i++)
        {
            this.m_listComponents[i].LateEnterFrame();
        }
    }

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

    public FindChild(name:number): KFBlockTarget
    {
        let child = this.GetChild(name);
        if(!child && this.parent)
        {
            child = this.parent.FindChild(name);
        }
        return child;
    }

    public GetChild(name:number): KFBlockTarget
    {
        let i:number = this.m_children.length -1;
        while (i >= 0)
        {
            let child:KFBlockTarget = this.m_children[i];
            if(child.name.value == name)
                return child;
            i -= 1;
        }
        return null;
    }

    public GetChildAt(index: number): KFBlockTarget
    {
        if(index >= this.m_children.length)
            return null;
        return this.m_children[index];
    }

    public RemoveChild(child: KFBlockTarget): void
    {
        if(child.parent == this)
        {
            let i = this.m_children.indexOf(child);
            if(i != -1)
            {
                this.m_children.splice(i,1);
                child.parent = null;
            }
        }
    }

    /// KFActorConfig
    protected LoadConfig(path:string):any
    {
        return this.runtime.configs.GetActorConfig(path,false);
    }

    public GetRuntime(): IKFRuntime
    {
        return this.runtime;
    }
}