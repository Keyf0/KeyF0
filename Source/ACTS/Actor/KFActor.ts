import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFComponentBase} from "./Components/KFComponentBase";
import {KFTimelineComponent} from "./Components/KFTimelineComponent";
import {KFGraphComponent} from "./Components/KFGraphComponent";
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

    protected m_children:Array<KFBlockTarget> = new Array<KFBlockTarget>();
    protected m_childrenmap:{[key:number]:KFBlockTarget;} = {};
    protected m_removelist:Array<KFBlockTarget> = [];

    public constructor()
    {
        super();
        this.tickable = true;
    }

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        super.Construct(metadata,runtime);
        this.etable = new KFEventTable();
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
        this.graph.ReleaseComponent();
    }

    public ActivateAllComponent():void
    {
        this.timeline.ActivateComponent();
        this.graph.ActivateComponent();
    }

    public DeactiveAllComponent():void
    {
        this.timeline.DeactiveComponent();
        this.graph.DeactiveComponent();
    }

    public Reset():void
    {
        this.ResetAllComponent();
    }

    protected TargetNew(KFBlockTargetData:any): any{}
    protected TargetDelete(){}

    public ActivateBLK(KFBlockTargetData:any):void
    {
        super.ActivateBLK(KFBlockTargetData);
        //把父级映射上去
        this.m_childrenmap[KFActor.PARENT.value] = <any>this.parent;
        this.TargetNew(KFBlockTargetData);
        this.ActivateAllComponent();
    }

    public DeactiveBLK():void
    {
        this.DeactiveAllComponent();
        delete this.m_childrenmap[KFActor.PARENT.value];
        this.TargetDelete();
    }

    public Tick(frameindex:number):void
    {
        if (this.pause) {return;}

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

    public ChildRename(oldname:number,child:KFBlockTarget):void
    {
        delete this.m_childrenmap[oldname];
        this.m_childrenmap[child.name.value] = child;
    }

    public AddChild(child: KFBlockTarget): void
    {
        let p = child.parent;
        if(p != this)
        {
            if(p != null)
                p.RemoveChild(child);
            this.m_children.push(child);
            this.m_childrenmap[child.name.value] = child;
            child.parent = this;
        }
    }

    public FindChild(name:number): KFBlockTarget
    {
        return this.m_childrenmap[name];
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
                delete this.m_childrenmap[child.name.value];
                child.parent = null;
            }
        }
    }

    public GetRuntime(): IKFRuntime
    {
        return this.runtime;
    }

    public CreateChild(targetdata:any,meta?:any):KFBlockTarget
    {
        let newtarget = this.runtime.domain
            .CreateBlockTarget(targetdata,meta);
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