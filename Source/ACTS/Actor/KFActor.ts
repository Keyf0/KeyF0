import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {KFComponentBase} from "./Components/KFComponentBase";
import {KFTimelineComponent} from "./Components/KFTimelineComponent";
import {KFGraphComponent} from "./Components/KFGraphComponent";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFDName, NVal} from "../../KFData/Format/KFDName";
import {KFScript} from "../../KFScript/KFScriptDef";
import {IKFDomain} from "../Context/IKFDomain";


export class KFActor extends KFBlockTarget implements IKFBlockTargetContainer
{
    public static Meta:IKFMeta = new IKFMeta("KFActor"

    ,():KFBlockTarget=>{
        return new KFActor();
    }
);

    public static PARENT:KFDName = new KFDName("parent");
    public static BEGIN_PLAY:KFEvent = new KFEvent(KFDName._Strs.GetNameID("onBeginPlay"));

    public pause:boolean  = false;
    public timeline:KFTimelineComponent;
    public graph:KFGraphComponent;

    public GetChildren():KFBlockTarget[]{return this.m_children;};

    protected m_children:KFBlockTarget[] = [];
    protected m_childrenmap:{[key:number]:KFBlockTarget;} = {};
    protected m_removelist:Array<KFBlockTarget> = [];
    protected m_keepsts:KFScript[];
    protected m_keepstmap:{[key:number]:KFScript;};
    protected m_bplay:boolean;
    protected m_CDomain:IKFDomain;

    public constructor()
    {
        super();
        this.tickable = true;
    }

    public Construct(metadata:any, runtime:IKFRuntime)
    {
        super.Construct(metadata,runtime);
        this.etable = new KFEventTable();
        this.m_CDomain = this.runtime.domain;
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
        this.StopKeepScripts();
        this.DeactiveAllComponent();
        this.DeleteChildren();
        ///这个顺序不知道可以不，先这样
        //delete this.m_childrenmap[KFActor.PARENT.value];
        this.TargetDelete();
    }

    public Tick(frameindex:number):void
    {
        if (this.pause) {return;}

        ///实始化后一第一帧TICK
        if(!this.m_bplay){
            this.m_bplay = true;
            this.etable.FireEvent(KFActor.BEGIN_PLAY);
        }

        ///暂时都不需要
        ///this.graph.EnterFrame(frameindex);
        this.timeline.EnterFrame(frameindex);

        for(let i = 0; i < this.m_children.length; i ++) {
            let child = this.m_children[i];
            if(child.tickable)
                child.Tick(frameindex);
        }

        ///tick保持住的脚本对象
        let scripti = this.m_keepsts ? this.m_keepsts.length -1 : -1;
        while (scripti >= 0){
            let sc = this.m_keepsts[scripti];
            sc.Update(frameindex);
            if(!sc.isrunning) {
                this.m_keepsts.splice(scripti,1);
                sc.Stop(this.m_keepstmap);
            }

            scripti -= 1;
        }

        ///删除元素
        let removelen = this.m_removelist.length;
        if(removelen > 0) {

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

    public FindChildBySID(sid:number):KFBlockTarget{
        for(let child of this.m_children){
            if(child.sid == sid)
                return child;
        }
        return null;
    }

    public FindChild(name:number): KFBlockTarget
    {
        return this.m_childrenmap[name];
    }

    public StrChild(name:string):KFBlockTarget{
        return this.m_childrenmap[NVal(name)];
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

    public CreateChild(targetdata:any,meta?:any,Init?:any):KFBlockTarget
    {
        let newtarget = this.m_CDomain.CreateBlockTarget(targetdata,meta);
        if (newtarget != null)
        {
            if(Init){
                Init(newtarget);
            }
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

    public DeleteChildren() {

        for(let child of this.m_children){
            child.DeactiveBLK();
            child.parent = null;
            this.runtime.domain.DestroyBlockTarget(child);
        }
        this.m_removelist.length = 0;
        this.m_children.length = 0;
        this.m_childrenmap = null;
    }

    public _DeleteChild(child:KFBlockTarget):boolean
    {
        child.DeactiveBLK();
        this.RemoveChild(child);
        this.runtime.domain.DestroyBlockTarget(child);

        return  true;
    }

    ///保持脚本
    public KeepScript(script:KFScript,type:KFDName):boolean {

        if(!this.m_keepsts) {
            this.m_keepsts = [];
            this.m_keepstmap = {};
        }
        script.Keep(this.m_keepstmap, type);
        this.m_keepsts.push(script);
        return true;

    }

    public FindScript(type:KFDName):KFScript {
        if(this.m_keepstmap){
            return this.m_keepstmap[type.value];
        }
        return null;
    }

    public StopKeepScripts() {
        if(this.m_keepsts) {
            let scripti = this.m_keepsts.length - 1;
            while (scripti >= 0) {
                this.m_keepsts[scripti].Stop(this.m_keepstmap);
                scripti -= 1;
            }
            this.m_keepsts.length = 0;
        }
    }

    ///FOR SCRIPT
    public StrBlock(name:string, op:number = 0){
        let block = this.graph.m_graph.GetBlockID(KFDName._Strs.GetNameID(name));
        if(block) {
            if(op == 1) {
                block.Input(null);
            }else if(op == -1){
                block.Deactive();
            }
        }
        return block;
    }
}