import {IKFDomain} from "./IKFDomain";
import {KFBlockTarget} from "./KFBlockTarget";
import {IKFRuntime} from "./IKFRuntime";
import {KFMetaManager} from "../../Core/Meta/KFMetaManager";

export class KFDomain implements IKFDomain
{
    private m_runtime:IKFRuntime;

    public constructor(runtime:IKFRuntime)
    {
        this.m_runtime = runtime;
    }

    public CreateBlockTarget(asseturl: string): KFBlockTarget
    {
        //let path = asseturl + ".meta";
        let metadata = this.m_runtime.configs.GetMetaData(asseturl, false);
        if(metadata)
        {
            let meta = KFMetaManager.GetMetaName(metadata.type);
            if (meta)
            {
                let target:KFBlockTarget = meta.instantiate();
                //kfgcRetain(target);
                //LOG_WARNING("Instantiate a BlockTarget: %s, %s", asseturl.c_str(), metadata->type.c_str());
                target.Construct(metadata, this.m_runtime);
                return target;
            }
            else
            {
                //LOG_ERROR("Cannot find meta: %s", metadata->type.c_str());
            }
        }
        else
        {
            //LOG_ERROR("Cannot find metadata: %s", asseturl.c_str());
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
        if(curr.iscontainer)
        {
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
        }

        return null;
    }

    public GenNextSid(): number
    {
        return 0;
    }

}