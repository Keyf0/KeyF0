import {IKFGraphContext} from "../../Graph/IKFGraphContext";
import {BlkExecSide, KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFScriptContext} from "../../../KFScript/KFScriptDef";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {KFGraphBlockBase} from "../../Graph/Blocks/KFGraphBlockBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KF_GRAPHARG_NULL, KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {KFGraphBlockNormal} from "../../Graph/Blocks/KFGraphBlockNormal";
import {KFGraphBlockExportPoint} from "../../Graph/Blocks/KFGraphBlockExportPoint";
import {KFGraphBlockEventPoint} from "../../Graph/Blocks/KFGraphBlockEventPoint";
import {IKFRuntime} from "../../Context/IKFRuntime";

export class KFGraphComponent implements IKFGraphContext
{
    public static Meta:IKFMeta
        = new IKFMeta("KFGraphComponent");
    public script: KFScriptContext;
    public targetObject:KFBlockTarget;
    public runtime: IKFRuntime;

    private m_cfg:any;
    private m_blocks:{[key:number]:KFGraphBlockBase} = {};
    private m_inputnames:Array<KFDName> = [];

    public constructor(target:KFBlockTarget)
    {
        this.targetObject = target;
        this.runtime = target.runtime;
        this.script = this.runtime.scripts;
    }

    public ReleaseComponent()
    {
        for (let key in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[key];
            if(block != null)
                block.Release();
        }
    }

    public ResetComponent()
    {
        this.Reset();
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.targetObject.metadata.asseturl,false);
        this.SetConfig(this.m_cfg);
        this.Play(null);
    }

    public ActivateComponent(inarg:any)
    {
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.targetObject.metadata.asseturl,false);
        this.SetConfig(this.m_cfg);
        this.Play(inarg);
    }

    public DeactiveComponent()
    {
        ///todo Deactive All Blocks
        this.m_cfg = null;
    }

    public SetConfig(cfg:any)
    {
        //TODO 在Editor模式下，这里有可能需要差量处理
        if (!cfg) return;

        for (let it in this.m_blocks)
        {
            this.m_blocks[it].Release();
        }

        this.m_blocks = {};
        this.m_inputnames.length = 0;
        this.m_cfg = cfg;

        let CurrSide = this.runtime.execSide;
        let owner = this.targetObject.owner;

        for ( let data of cfg.data.blocks)
        {
            ///不在客户端创建
            let tdata = data.target;

            let execSide = (tdata && tdata.execSide) ? tdata.execSide : BlkExecSide.BOTH;
            if((CurrSide & execSide) == 0)
                continue;
            ///如果是主客户端
            if(execSide == BlkExecSide.SELFCLIENT && !owner){
                continue;
            }

            let block:KFGraphBlockBase = null;
            switch (data.type)
            {
                case KFGraphBlockType.Normal:
                    block = new KFGraphBlockNormal();
                    break;
                case KFGraphBlockType.OutputPoint:
                case KFGraphBlockType.OutputPointGlobal:
                case KFGraphBlockType.OutputPointDomain:
                case KFGraphBlockType.InputPoint:
                    block = new KFGraphBlockExportPoint();
                    break;
                case KFGraphBlockType.EventPoint:
                case KFGraphBlockType.EventPointGlobal:
                case KFGraphBlockType.EventPointDomain:
                    block = new KFGraphBlockEventPoint();
                    break;

                default:;
            }

            if(block)
            {
                block.Create(this, data);
                this.m_blocks[data.name.value] = block;

                if(data.type == KFGraphBlockType.InputPoint)
                {
                    this.m_inputnames.push(data.name);
                }
            }
            else
            {
                //LOG_ERROR("Don't Support Block Type:%d", data.type);
            }
        }
    }

    public Play(inarg:any)
    {
        inarg = inarg==undefined?KF_GRAPHARG_NULL:inarg
        for (let it in this.m_inputnames)
        {
            let blockname:KFDName  = this.m_inputnames[it];
            let block = this.m_blocks[blockname.value];
            if(block)
            {
                block.Input(inarg);
            }
        }
    }

    public Stop()
    {
        for (let it in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[it];
            block.Deactive();
        }
    }

    public Reset()
    {
        for (let it in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[it];
            block.Reset();
        }
    }

    public HasBlock(id:KFDName):boolean
    {
        return this.m_blocks[id.value] != null;
    }

    public GetBlock(id:KFDName):KFGraphBlockBase
    {
        return this.m_blocks[id.value];
    }

    public GetBlockID(id:number):KFGraphBlockBase
    {
        return this.m_blocks[id];
    }

    public Input(blockname:KFDName, arg:any)
    {
        if(blockname)
        {
            let block = this.m_blocks[blockname.value];
            if (block != null) {
                if (arg != undefined) block.Input(arg);
                else block.Input(KF_GRAPHARG_NULL);
            } else {
                //LOG_TAG_ERROR("Can't find block: %s", blockname.c_str());
            }
        }
    }
}