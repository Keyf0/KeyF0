import {IKFDomain} from "./IKFDomain";
import {BlkExecSide, KFBlockTarget} from "./KFBlockTarget";
import {IKFRuntime} from "./IKFRuntime";
import {KFMetaManager} from "../../Core/Meta/KFMetaManager";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFConfigs} from "./IKFConfigs";

export class KFDomain implements IKFDomain
{
    private m_runtime:IKFRuntime;
    private m_incrsid:number;
    private m_execSide:number;
    private m_NoSideLog:string;
    private m_configs:IKFConfigs;

    public constructor(runtime:IKFRuntime)
    {
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
                if((meta.execSide & this.m_execSide) == 0){
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

                let instname = KFBlockTargetData.instname;
                if(!instname || instname.value == 0)
                {
                    instname = new KFDName("blk_" + currsid);
                }

                target.name = instname;
                target.sid = currsid;

                LOG("创建 BlockTarget: {0}, {1}", asseturl, metadata.type.toString());
                target.Construct(metadata, this.m_runtime);


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

        LOG("销毁 BlockTarget:{0}",target.metadata.asseturl);
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

}