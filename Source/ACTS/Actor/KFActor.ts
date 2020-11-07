import {IKFBlockTargetContainer, KFBlockTarget} from "../Context/KFBlockTarget";
import {IKFRuntime} from "../Context/IKFRuntime";
import {KFEvent} from "../../Core/Misc/KFEventTable";
import {KFTimelineComponent} from "./Components/KFTimelineComponent";
import {KFGraphComponent} from "./Components/KFGraphComponent";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFDomain} from "../Context/IKFDomain";
import {KFScript, KFScriptContext} from "../Script/KFScriptDef";
import {KFEventDispatcher} from "../Event/KFEventDispatcher";
import {KFTargetScript} from "../Script/KFScriptSystem";


export class KFActor extends KFBlockTarget implements IKFBlockTargetContainer
{
    public static Meta:IKFMeta = new IKFMeta("KFActor"

    ,():KFBlockTarget=>{
        return new KFActor();
    }
    );

    public static PARENT:KFDName = new KFDName("parent");
    public static SELF:KFDName = new KFDName("self");
    public static BEGIN_PLAY:KFEvent = new KFEvent(KFDName._Strs.GetNameID("onBeginPlay"));
    public static END_PLAY:KFEvent = new KFEvent(KFDName._Strs.GetNameID("onEndPlay"));

    ///控制整个TICK
    public pause:boolean  = false;

    ///控制时间轴的播放
    public isPlaying:boolean = true;
    public stateid:number = -1;
    public currframeindex:number = 0;

    ///时间轴上的脚本执行
    public tlProcKeyFrames:Array<{ target: any; keyframe: any; }> = [];
    public tlProcSize:number = 0;

    public timeline:KFTimelineComponent;
    public graph:KFGraphComponent;

    public rpcc_exec:(scriptdata:any)=>any;
    public rpcs_exec:(scriptdata:any)=>any;

    public GetChildren():KFBlockTarget[]{return this.m_children;};

    protected m_children:KFBlockTarget[] = [];
    protected m_childrenmap:{[key:number]:KFBlockTarget;} = {};
    protected m_removelist:Array<KFBlockTarget> = [];
    protected m_keepsts:KFTargetScript[];
    protected m_keepstmap:{[key:number]:KFTargetScript;};
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

        this.m_CDomain = this.runtime.domain;
        this.etable = new KFEventDispatcher(this.m_CDomain);
        this.rpcc_exec = this.Exec;
        this.rpcs_exec = this.Exec;
        this.Init(this.metadata.asseturl);
    }

    public Exec(sd:any) {this.runtime.scripts.Execute(sd,this);}

    ///调用到服务器然后广播出去
    public rpcs_broadcast(scriptdata:any)
    {
        this.runtime.scripts.Execute(scriptdata,this);
        this.rpcc_exec(scriptdata);
    }

    public Init(asseturl:string):void
    {
        if(this.timeline == null)
        {
            this.timeline = this.m_CDomain.CreateTimelineComponent(asseturl);
            this.graph = this.m_CDomain.CreateGraphComponent(asseturl);
        }
    }

    public ActivateAllComponent(inarg:any):void
    {
        this.timeline.ActivateComponent(this);
        this.graph.ActivateComponent(this, inarg);
    }

    public DeactiveAllComponent():void
    {
        this.timeline.DeactiveComponent(this);
        this.graph.DeactiveComponent(this);
    }

    protected TargetNew(KFBlockTargetData:any): any{}
    protected TargetDelete(){}

    public ActivateBLK(KFBlockTargetData:any):void
    {
        super.ActivateBLK(KFBlockTargetData);
        //把父级映射上去
        this.m_childrenmap[KFActor.PARENT.value] = <any>this.parent;
        this.m_childrenmap[KFActor.SELF.value] = <any>this;
        this.TargetNew(KFBlockTargetData);
        this.ActivateAllComponent(KFBlockTargetData.inputArg);
    }

    public DeactiveBLK():void
    {
        if(this.etable) {
            ///发送结束且清空etable
            this.etable.FireEvent(KFActor.END_PLAY);
            this.etable.Clear();
        }

        this.StopKeepScripts();
        this.DeactiveAllComponent();
        this.DeleteChildren();
        ///这个顺序不知道可以不，先这样
        //delete this.m_childrenmap[KFActor.PARENT.value];
        this.TargetDelete();
    }

    public EditTick(frameindex:number):void
    {
        if (this.pause) {return;}

        ///实始化后一第一帧TICK
        if(!this.m_bplay)
        {
            this.m_bplay = true;
            this.etable.FireEvent(KFActor.BEGIN_PLAY);
        }

        ///暂时都不需要
        //this.timeline.EnterFrame(frameindex);

        for(let i = 0; i < this.m_children.length; i ++)
        {
            let child = this.m_children[i];
            if(child.tickable)
                child.EditTick(frameindex);
        }

        ///tick保持住的脚本对象
        //let scripti = this.m_keepsts ? this.m_keepsts.length -1 : -1;
        //while (scripti >= 0){
        //    let sc = this.m_keepsts[scripti];
        //    sc.Update(frameindex);
        //    if(!sc.isrunning) {
        //        this.m_keepsts.splice(scripti,1);
        //        sc.Stop(this.m_keepstmap);
        //    }
        //    scripti -= 1;
        //}

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
        this.timeline.EnterFrame(this,frameindex);

        for(let i = 0; i < this.m_children.length; i ++) {
            let child = this.m_children[i];
            if(child.tickable)
                child.Tick(frameindex);
        }

        ///tick保持住的脚本对象
        let scriptcontext:KFScriptContext = this.runtime.scripts;
        let scripti = this.m_keepsts ? this.m_keepsts.length -1 : -1;
        while (scripti >= 0)
        {
            let sc = this.m_keepsts[scripti];
            sc.Update(frameindex);
            if(!sc.isrunning)
            {
                let stype:KFDName = sc.type;

                this.m_keepsts.splice(scripti,1);

                sc.Stop();

                delete this.m_keepstmap[stype.value];
                scriptcontext.ReturnScript(sc, stype);
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

    public StrChild(name:string):KFBlockTarget {
        if(name.indexOf(".") != -1){
            let names:string[] = name.split(".");
            let i  = 0;
            let namelen = names.length;
            let c:any = this;
            let str2id = KFDName._Strs._Strings2ID;


            while (i < namelen){
                if(c == null)
                    return null;
                let chmap = c.m_childrenmap;
                c = chmap[str2id[names[i]]];
                i += 1;
            }
            return c;
        }
        else
            return this.m_childrenmap[KFDName._Strs._Strings2ID[name]];
    }

    public GetChildAt(index: number): KFBlockTarget
    {
        if(index >= this.m_children.length)
            return null;
        return this.m_children[index];
    }

    public RemoveChild(child: KFBlockTarget): void
    {
        if(child.parent == this) {
            let i = this.m_children.indexOf(child);
            if(i != -1) {
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

    public CreateChildByData(NewBlkData:any,Init?:any):KFBlockTarget
    {
        if(NewBlkData)
        {
            let MetaData = NewBlkData.metaData;
            MetaData = (MetaData && MetaData.data) ? MetaData : null;

            let self:KFActor = this;
            let newtarget = this.CreateChild(NewBlkData.targetData, MetaData
                ,function (newtarget:KFBlockTarget) {
                    ///
                    if(newtarget)
                    {
                        let MetaData = NewBlkData.metaData;
                        if(MetaData && MetaData.fields)
                        {
                            ///用数据对填充
                            let items = MetaData.fields.items;
                            if(items){
                                for(let i = 0;i < items.length; i++){
                                    let data = items[i];
                                    let valueobj:any = self.vars[data.key];
                                    if(valueobj) {
                                        valueobj.setValue(data.value);
                                    }
                                    else
                                        this.vars[data.key] = data.value;
                                }
                            }
                        }
                    }
                    ///
                    if(Init){
                        Init(newtarget);
                    }
            });

            return newtarget;
        }

        return null;
    }

    public CreateChild(targetdata:any,meta?:any,Init?:any,search?:boolean):KFBlockTarget
    {
        if(search)
        {
            let instname:KFDName = targetdata.instname;
            let child:KFBlockTarget = (instname && instname.value != 0)
                ? this.m_childrenmap[instname.value] : null;
            if(child) return child;
        }

        let newtarget = this.m_CDomain.CreateBlockTarget(targetdata, meta);
        if (newtarget != null)
        {
            if(Init)
            {
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

    public DeleteChildrenBySuffix(suffix:string)
    {
        for(let child of this.m_children){
            let childname:string = child.name.toString();
            if(childname.indexOf(suffix) == 0){
                this.m_removelist.push(child);
            }
        }
    }

    public DeleteChildren() {

        for(let child of this.m_children){
            child.DeactiveBLK();
            child.parent = null;
            this.runtime.domain.DestroyBlockTarget(child);
        }
        this.m_removelist.length = 0;
        this.m_children.length = 0;
        this.m_childrenmap = {};
    }

    public _DeleteChild(child:KFBlockTarget):boolean
    {
        child.DeactiveBLK();
        this.RemoveChild(child);
        this.runtime.domain.DestroyBlockTarget(child);
        return  true;
    }

    public ExecuteScript(sd: any, scriptContext:KFScriptContext):any
    {
        let type:KFDName = sd.type;
        let targetscript:KFTargetScript = this.m_keepstmap ? this.m_keepstmap[type.value] : null;

        if(targetscript == null)
        {
            targetscript = <any>scriptContext.BorrowScript(type);

            if(!this.m_keepsts)
            {
                this.m_keepsts = [];
                this.m_keepstmap = {};
            }

            this.m_keepstmap[type.value] = targetscript;
            this.m_keepsts.push(targetscript);
        }

        return targetscript.Execute(sd, scriptContext);
    }

    public FindScript(type:KFDName):KFScript
    {
        if(this.m_keepstmap)
        {
            return this.m_keepstmap[type.value];
        }
        return null;
    }

    public StopKeepScripts()
    {
        if(this.m_keepsts)
        {
            let scriptcontext:KFScriptContext = this.runtime.scripts;
            let scripti = this.m_keepsts.length - 1;
            while (scripti >= 0)
            {
                let script:KFTargetScript = this.m_keepsts[scripti];
                let stype:KFDName = script.type;

                script.Stop();

                delete this.m_keepstmap[stype.value];
                scriptcontext.ReturnScript(script, stype);

                scripti -= 1;
            }
            this.m_keepsts.length = 0;
        }
    }


    ///FOR SCRIPT
    public StrBlock(name:string, op:number = 0)
    {
        let block = this.graph.GetBlockID(KFDName._Strs._Strings2ID[name]);
        if(block)
        {
            if(op == 1)
            {
                block.Input(this,null);
            }
            else if(op == -1)
            {
                block.Deactive(this);
            }
        }
        return block;
    }

    ///FOR SCRIPT
    public InputBlock(name:string, arg:any = null):void
    {
        let block = this.graph.GetBlockID(KFDName._Strs._Strings2ID[name]);
        if(block) {
            block.Input(this, arg);
        }
    }

    public Play(stateid:number)
    {
        this.timeline.Play(this, stateid);
    }
}