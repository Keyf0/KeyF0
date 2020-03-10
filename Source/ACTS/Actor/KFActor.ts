import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFComponentBase} from "./Components/KFComponentBase";
import {KFTimelineComponent} from "./Components/KFTimelineComponent";
import {KFGraphComponent} from "./Components/KFGraphComponent";
import {KFScriptComponent} from "./Components/KFScriptComponent";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFDName} from "../../KFData/Format/KFDName";



export class KFActor extends KFBlockTarget implements IKFBlockTargetContainer
{
    public static Meta:IKFMeta = new IKFMeta("KFActor"

    ,():KFBlockTarget=>{
        return new KFActor();
    }
);

    public static PARENT:KFDName = new KFDName("parent");

    public pause:boolean  = false;
    public timeline:KFTimelineComponent;
    public graph:KFGraphComponent;
    public script:KFScriptComponent;

    protected m_children:Array<KFBlockTarget> = new Array<KFBlockTarget>();
    protected m_removelist:Array<KFBlockTarget> = [];

    public constructor()
    {
        super();
        this.tickable = true;
    }

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
        return p;
    }

    public ResetAllComponent():void
    {
        this.timeline.ResetComponent();
        this.script.ResetComponent();
        this.graph.ReleaseComponent();
    }

    public ActivateAllComponent():void
    {
        this.timeline.ActivateComponent();
        this.script.ActivateComponent();
        this.graph.ActivateComponent();
    }

    public DeactiveAllComponent():void
    {
        this.timeline.DeactiveComponent();
        this.script.DeactiveComponent();
        this.graph.DeactiveComponent();
    }

    public Reset():void
    {
        this.ResetAllComponent();
    }

    public ActivateBLK(KFBlockTargetData:any):void
    {
        super.ActivateBLK(KFBlockTargetData);
        this.etable = new KFEventTable();
        this.ActivateAllComponent();
    }

    public DeactiveBLK():void
    {
        this.DeactiveAllComponent();
        this.etable = null;
    }

    public Tick(frameindex:number):void
    {
        if (this.pause) {return;}

        this.script.EnterFrame(frameindex);
        ///暂时都不需要
        ///this.graph.EnterFrame(frameindex);
        this.timeline.EnterFrame(frameindex);

        for(let i = 0; i < this.m_children.length; i ++)
        {
            let child = this.m_children[i];
            if(child.tickable)
                child.Tick(frameindex);
        }

        ///删除元素
        let removelen = this.m_removelist.length;
        if(removelen > 0)
        {
            for(let i = 0; i < removelen; i ++)
            {
                let t = this.m_removelist[i];
                this._DeleteChild(t);
            }
            this.m_removelist.length = 0;
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
        if(name == KFActor.PARENT.value)
        {
            return <any>this.parent;
        }
        let child = this.GetChild(name);
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

    public GetRuntime(): IKFRuntime
    {
        return this.runtime;
    }

    public CreateChild(targetdata):KFBlockTarget
    {
        let newtarget = this.runtime.domain
            .CreateBlockTarget(targetdata);
        if (newtarget != null)
        {
            this.AddChild(newtarget);
            newtarget.ActivateBLK(targetdata);
        }
        return newtarget;
    }

    public DeleteChild(child:KFBlockTarget):boolean
    {
        this.m_removelist.push(child);
        return true;
    }

    private _DeleteChild(child:KFBlockTarget):boolean
    {
        child.DeactiveBLK();
        this.RemoveChild(child);
        this.runtime.domain.DestroyBlockTarget(child);

        return  true;
    }
}