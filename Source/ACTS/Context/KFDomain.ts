import {IKFDomain} from "./IKFDomain";
import {KFBlockTarget} from "./KFBlockTarget";
import {IKFRuntime} from "./IKFRuntime";
import {KFMetaManager} from "../../Core/Meta/KFMetaManager";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";

export class KFDomain implements IKFDomain
{
    private m_runtime:IKFRuntime;
    private m_incrsid:number = 0;

    public constructor(runtime:IKFRuntime)
    {
        this.m_runtime = runtime;
    }

    public CreateBlockTarget(KFBlockTargetData: any): KFBlockTarget
    {
        let asseturl = KFBlockTargetData.asseturl;
        //let path = asseturl + ".meta";
        let metadata = this.m_runtime.configs.GetMetaData(asseturl, false);
        if(metadata)
        {
            let meta = KFMetaManager.GetMetaName(metadata.type);
            if (meta)
            {
                let target:KFBlockTarget = meta.instantiate();
                //kfgcRetain(target);
                LOG("创建 BlockTarget: {0}, {1}", asseturl, metadata.type.toString());
                target.Construct(metadata, this.m_runtime);
                this.m_incrsid += 1;

                target.name = KFBlockTargetData.instname;
                target.sid = this.m_incrsid;

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