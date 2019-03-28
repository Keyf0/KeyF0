import {IKFGraphContext} from "./IKFGraphContext";
import {KFGraphBlockBase} from "./Blocks/KFGraphBlockBase";
import {KFGraphBlockExportPoint} from "./Blocks/KFGraphBlockExportPoint";
import {KFDName} from "../../KFData/Format/KFDName";
import {KF_GRAPHARG_NULL, KFGraphBlockType} from "../Data/KFGraphBlockType";
import {KFGraphBlockNormal} from "./Blocks/KFGraphBlockNormal";
import {KFGraphBlockEventPoint} from "./Blocks/KFGraphBlockEventPoint";

export class KFGraph
{
    private m_ctx:IKFGraphContext;
    private m_cfg:any;
    private m_blocks:{[key:number]:KFGraphBlockBase} = {};
    private m_blocks_cache:{[key:number]:KFGraphBlockBase} = {};

    ///key:KFDName
    private m_inputs:{[key:number]:KFGraphBlockExportPoint} = {};

    public currblock:KFGraphBlockBase;
    public IsPlaying:boolean;

    public constructor(ctx:IKFGraphContext)
    {
        this.m_ctx = ctx;
    }

    public Release()
    {
        for (let key in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[key];
            if(block != null)
                block.Release();
        }
    }

    public Activate(owner:number):void{}
    public Deactive(){}

    public SetConfig(cfg:any)
    {
        //TODO 在Editor模式下，这里有可能需要差量处理
        if (!cfg) return;

        for (let it in this.m_blocks)
        {
            this.m_blocks[it].Release();
        }
        this.m_blocks = {};
        this.m_cfg = cfg;

        for ( let data of cfg.data.blocks)
        {
            let block:KFGraphBlockBase = null;
            switch (data.type)
            {
                case KFGraphBlockType.Normal:block = new KFGraphBlockNormal();	break;
                case KFGraphBlockType.OutputPoint:block = new KFGraphBlockExportPoint();	break;
                case KFGraphBlockType.InputPoint: block = new KFGraphBlockExportPoint();	break;
                case KFGraphBlockType.EventPoint:block = new KFGraphBlockEventPoint();	break;

                default:;
            }

            if(block)
            {
                block.Create(this.m_ctx, data);
                this.m_blocks[data.id] = block;

                if(data.type == KFGraphBlockType.InputPoint)
                {
                    this.m_inputs[data.name] = block;
                }
            }
            else
            {
                //LOG_ERROR("Don't Support Block Type:%d", data.type);
            }
        }
    }

    public Play()
    {
        for (let it in this.m_blocks)
        {
            let block:KFGraphBlockBase = this.m_blocks[it];

            let outputs = block.data.outputs;
            for (let i = 0; i < outputs.length; ++i)
            {
                let o = outputs[i];//KFGraphBlockOPinData
                let dest = this.m_blocks[o.dest];

                if(dest)
                {
                    block.BindOutput(i, dest);
                }
            }

        }

        this.IsPlaying = true;

        for (let it in this.m_blocks)
        {
            let block = this.m_blocks[it];
            if(block.data.autorun)
            {
                block.Input(KF_GRAPHARG_NULL);
            }
        }
    }

    public Stop()
    {
        this.IsPlaying = false;

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

    public HasBlock(id:number):boolean
    {
        return this.m_blocks[id] != null;
    }

    public Tick():void
    {
        if(this.IsPlaying)
        {
            for (let it in this.m_blocks)
            {
                this.m_blocks[it].Tick();
            }
        }
    }

    public ExecuteBlock(blockname:KFDName, arg:any):void
    {
        //LOG_TAG_WARNING("%s", blockname.c_str());
        let block = this.m_blocks_cache[blockname.value];
        if(block == null) {

            for (let it in this.m_blocks)
            {
                let tmpb:KFGraphBlockBase = this.m_blocks[it];
                if (blockname.value == tmpb.data.name.value)
                {
                    this.m_blocks_cache[blockname.value] = tmpb;
                    block = tmpb;
                    break;
                }
            }
        }

        if(block)
        {
            if(arg) block.Input(arg);
            else block.Input(KF_GRAPHARG_NULL);
        }
    }

    public GetBlock(id:number):KFGraphBlockBase
    {
        return this.m_blocks[id];
    }

    public Input(blockname:KFDName,arg:any)
    {
        let block = this.m_inputs[blockname.value];
        if (block != null)
        {
            if(arg) block.Input(arg);
            else block.Input(KF_GRAPHARG_NULL);
        }
        else
        {
            //LOG_TAG_ERROR("Can't find block: %s", blockname.c_str());
        }
    }
}