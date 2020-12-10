import {IKFDomain} from "./IKFDomain";
import {BlkExecSide, KFBlockTarget} from "./KFBlockTarget";
import {IKFRuntime} from "./IKFRuntime";
import {KFMetaManager} from "../../Core/Meta/KFMetaManager";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFConfigs} from "./IKFConfigs";
import {KFGraphComponent} from "../Actor/Components/KFGraphComponent";
import {KFTimelineComponent} from "../Actor/Components/KFTimelineComponent";
import {KFBytes} from "../../KFData/Format/KFBytes";


export class KFGraphSystem
{
    private m_rt:IKFRuntime;
    private m_instances:{[key:string]:KFGraphComponent};

    public constructor(runtime:IKFRuntime)
    {
        this.m_rt = runtime;
        this.m_instances = {};
    }

    public Create(asseturl:string): KFGraphComponent
    {
        let getinst:KFGraphComponent = this.m_instances[asseturl];
        if(getinst == null)
        {
            getinst = new KFGraphComponent(this.m_rt, asseturl);
            this.m_instances[asseturl] = getinst;
        }

        return getinst;
    }

    public Destroy(graph: KFGraphComponent): void
    {}
}

export class KFTimelineSystem
{
    private m_rt:IKFRuntime;
    private m_instances:{[key:string]:KFTimelineComponent};

    public constructor(runtime:IKFRuntime)
    {
        this.m_rt = runtime;
        this.m_instances = {};
    }

    public Create(asseturl:string): KFTimelineComponent
    {
        let getinst:KFTimelineComponent = this.m_instances[asseturl];
        if(getinst == null)
        {
            getinst = new KFTimelineComponent(this.m_rt, asseturl);
            this.m_instances[asseturl] = getinst;
        }
        return getinst;
    }

    public Destroy(timeline: KFTimelineComponent): void
    {}
}


export class KFDomain implements IKFDomain
{
    private m_runtime:IKFRuntime;
    private m_incrsid:number;
    private m_execSide:number;
    private m_NoSideLog:string;
    private m_configs:IKFConfigs;

    private m_graphsystem:KFGraphSystem;
    private m_timelinesystem:KFTimelineSystem;

    private m_instances:{[key:string]:KFBlockTarget};

    public constructor(runtime:IKFRuntime)
    {
        this.m_instances = {};
        this.m_runtime = runtime;
        this.m_configs = runtime.configs;
        this.m_execSide = runtime.execSide;
        let endstr = "服务端";
        ///客户端创建的ID从一个很大的数字开始
        this.m_incrsid = 0;
        if(this.m_execSide ==  BlkExecSide.CLIENT)
        {
            endstr = "客户端";
            this.m_incrsid = 90000000;
        }
        this.m_NoSideLog = "{0} 不能创建在" + endstr ;

        this.m_graphsystem = new KFGraphSystem(runtime);
        this.m_timelinesystem = new KFTimelineSystem(runtime);
    }

    public CreateBlockTarget(KFBlockTargetData: any,meta?:any): KFBlockTarget
    {
        let asseturl = KFBlockTargetData.asseturl;

        ///可创建判定
        let execSide = KFBlockTargetData.execSide ? KFBlockTargetData.execSide : BlkExecSide.BOTH;
        if((this.m_execSide & execSide) == 0) {
            return null;
        }


        //let path = asseturl + ".meta";
        let metadata = meta ? meta : this.m_configs.GetMetaData(asseturl, false);
        if(metadata)
        {
            let meta = KFMetaManager.GetMetaName(metadata.type);
            if (meta)
            {
                if((meta.execSide & this.m_execSide) == 0)
                {
                    LOG(this.m_NoSideLog, asseturl);
                    return null;
                }

                let target:KFBlockTarget = meta.instantiate();
                //kfgcRetain(target);
                let currsid = KFBlockTargetData.instsid;
                if(!currsid || currsid == 0)
                {
                    this.m_incrsid += 1;
                    currsid = this.m_incrsid;
                }
                else if(currsid > this.m_incrsid)
                {
                    ///需要更大的数据增量
                    this.m_incrsid = currsid;
                }

                let instname = KFBlockTargetData.instname;
                if(!instname || instname.value == 0)
                {
                    instname = new KFDName("blk_" + currsid);
                }

                target.name = instname;
                target.sid = currsid;

                this.m_instances[currsid] = target;

                let initdata:KFBytes = KFBlockTargetData.initBytes;
                let initBytes = initdata ? initdata.bytes : null;

                LOG("创建 BlockTarget: {0}, {1}", asseturl, metadata.type.toString());

                target.Construct(metadata, this.m_runtime, initBytes);

                return target;
            }
            else
            {
                LOG_ERROR("Cannot find meta: {0}", metadata.type.toString());
            }
        }
        else
        {
            LOG_ERROR("Cannot find metadata: {0}", asseturl);
        }

        return null;
    }

    public DestroyBlockTarget(target: KFBlockTarget): void
    {
        ///kfgcRelease(target);
        let sid = target.sid;
        let meta = target.metadata;
        let asseturl = meta.asseturl;
        if(asseturl == undefined)
        {
            asseturl = target.name.toString();
        }

        delete this.m_instances[sid];

        LOG("销毁 BlockTarget:{0}",asseturl);
    }

    public FindBlockTarget(instpath: string): KFBlockTarget
    {
        let curr:any = this.m_runtime;

        let tokens = instpath.split("/");
        let cnt = tokens.length;

        let i:number = 0;
        for (; i < cnt - 1; ++i)
        {
            let idx:number =  Number(tokens[i]);
            let child = curr.GetChild(idx);
            if(child)
            {
                curr = child;
                if(!curr.iscontainer) {break;}
            }
            else {break;}
        }

        if(i == cnt - 1)
        {
            tokens = tokens[i].split("?");
            let idx:number = Number(tokens[0]);
            let child = curr.GetChild(idx);

            if(tokens.length == 2)
            {
                if(child)
                {
                    //uint64 ptr = Number(tokens[1]);
                    //if((void*)child == (void*)(ptr))
                    {
                        return child;
                    }
                }
            }else
                return child;
        }


        return null;
    }

    public GenNextSid(): number
    {
        this.m_incrsid += 1;
        return this.m_incrsid;
    }

    public CreateGraphComponent(asseturl:string): KFGraphComponent
    {
        return this.m_graphsystem.Create(asseturl);
    }

    public DestroyGraphComponent(graph: KFGraphComponent): void
    {
        this.m_graphsystem.Destroy(graph);
    }

    public DestroyTimelineComponent(timeline: KFTimelineComponent): void
    {
        this.m_timelinesystem.Destroy(timeline);
    }

    public CreateTimelineComponent(asseturl: string): KFTimelineComponent
    {
        return this.m_timelinesystem.Create(asseturl);
    }


    public GetBlockTarget(instSID: number): KFBlockTarget {
        return undefined;
    }


}