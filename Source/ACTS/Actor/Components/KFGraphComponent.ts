import {IKFGraphContext} from "../../Graph/IKFGraphContext";
import {BlkExecSide, KFBlockTarget} from "../../Context/KFBlockTarget";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {KFGraphBlockBase} from "../../Graph/Blocks/KFGraphBlockBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {GRAPH_ARG_NULL, GRAPH_NAME_ACTIVATE, KFGraphBlockType} from "../../Data/KFGraphBlockType";
import {KFGraphBlockNormal} from "../../Graph/Blocks/KFGraphBlockNormal";
import {KFGraphBlockExportPoint} from "../../Graph/Blocks/KFGraphBlockExportPoint";
import {KFGraphBlockEventPoint} from "../../Graph/Blocks/KFGraphBlockEventPoint";
import {IKFRuntime} from "../../Context/IKFRuntime";
import {KFScriptContext} from "../../Script/KFScriptDef";
import {KFPullNode} from "../../Graph/Blocks/KFPullNode";

export class KFGraphComponent implements IKFGraphContext
{
    public static Meta:IKFMeta
        = new IKFMeta("KFGraphComponent");

    public script: KFScriptContext;
    public runtime: IKFRuntime;
    public asseturl:string;

    private m_cfg:any;
    private m_blocks:{[key:number]:KFGraphBlockBase} = {};
    private m_inputnames:Array<KFDName> = [];

    public constructor(runtime:IKFRuntime, asseturl:string)
    {
        this.runtime = runtime;
        this.script = runtime.scripts;
        this.asseturl = asseturl;
    }

    public ReleaseComponent(self:KFBlockTarget)
    {
        for (let key in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[key];
            if(block != null)
                block.Release(self);
        }
    }

    public ActivateComponent(self:KFBlockTarget)
    {
        if(this.m_cfg == null)
        {
            this.m_cfg = this.runtime.configs.GetGraphConfig(this.asseturl, false);
            this.SetConfig(self, this.m_cfg);
        }

        //播入所有INPUT节点
        this.ActivateInput(self, GRAPH_ARG_NULL);
        //this.Input(self, GRAPH_NAME_ACTIVATE, GRAPH_ARG_NULL);
    }

    public DeactiveComponent(self:KFBlockTarget)
    {
        ///todo Deactive All Blocks
    }

    public SetConfig(self:KFBlockTarget, cfg:any)
    {
        //TODO 在Editor模式下，这里有可能需要差量处理
        if (!cfg) return;

        for (let it in this.m_blocks)
        {
            this.m_blocks[it].Release(self);
        }

        this.m_blocks = {};
        this.m_inputnames.length = 0;
        this.m_cfg = cfg;

        let CurrSide = this.runtime.execSide;

        for ( let data of cfg.data.blocks)
        {
            ///不在客户端创建
            let tdata = data.target;

            let execSide = (tdata && tdata.execSide) ? tdata.execSide : BlkExecSide.BOTH;
            if((CurrSide & execSide) == 0)
                continue;

            ///如果是主客户端
            if(execSide == BlkExecSide.SELFCLIENT)
            {
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
                case KFGraphBlockType.PullNode:
                    block = new KFPullNode();
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

    ///初始化激活所有INPUT节点
    public ActivateInput(self:KFBlockTarget, inarg:any)
    {
        inarg = inarg==undefined ? GRAPH_ARG_NULL:inarg;

        for (let it in this.m_inputnames)
        {
            let blockname:KFDName  = this.m_inputnames[it];
            let block = this.m_blocks[blockname.value];
            if(block)
            {
                block.Input(self, inarg);
            }
        }
    }

    public Stop(self:KFBlockTarget)
    {
        for (let it in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[it];
            block.Deactive(self);
        }
    }

    public Reset(self:KFBlockTarget)
    {
        for (let it in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[it];
            block.Reset(self);
        }
    }

    public HasBlock(id:KFDName):boolean
    {
        return this.m_blocks[id.value] != null;
    }

    public GetBlock(id:KFDName):KFGraphBlockBase
    {
        return id ? this.m_blocks[id.value] : null;
    }

    public GetBlockID(id:number):KFGraphBlockBase
    {
        return this.m_blocks[id];
    }

    public GetBlockStr(name:string):KFGraphBlockBase
    {
        return this.m_blocks[KFDName._Strs._Strings2ID[name]];
    }

    public Input(self:KFBlockTarget, blockname:KFDName, arg:any)
    {
        if(blockname)
        {
            let block = this.m_blocks[blockname.value];
            if (block != null)
            {
                block.Input(self, arg);
            }
            else
            {
                //LOG_TAG_ERROR("Can't find block: %s", blockname.c_str());
            }
        }
    }
}