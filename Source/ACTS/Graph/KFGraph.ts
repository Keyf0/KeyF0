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
    private m_tickblks:Array<KFGraphBlockBase> = [];
    private m_inputnames:Array<KFDName> = [];

    public currblock:KFGraphBlockBase = null;
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
        this.m_inputnames.length = 0;
        this.m_tickblks.length  = 0;
        this.m_cfg = cfg;

        for ( let data of cfg.data.blocks)
        {
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
                block.Create(this.m_ctx, data);
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

    public Play()
    {
        this.IsPlaying = true;

        for (let it in this.m_inputnames)
        {
            let blockname:KFDName  = this.m_inputnames[it];
            let block = this.m_blocks[blockname.value];
            if(block)
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

    public HasBlock(id:KFDName):boolean
    {
        return this.m_blocks[id.value] != null;
    }

    public GetBlock(id:KFDName):KFGraphBlockBase
    {
        return this.m_blocks[id.value];
    }

    public AddTickBlock(block:KFGraphBlockBase):void
    {
        this.m_tickblks.push(block);
    }

    public RemoveTickBlock(block:KFGraphBlockBase):void
    {
        let i = this.m_tickblks.indexOf(block);
        if(i != -1)
            this.m_tickblks.splice(i,1);
    }

    public Input(blockname:KFDName, arg:any)
    {
        let block = this.m_blocks[blockname.value];
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

    public Tick(frameIndex:number):void
    {
        let i = this.m_tickblks.length - 1;
        while (i >= 0)
        {
            this.m_tickblks[i].Tick(frameIndex);
            i -= 1;
        }
    }
}