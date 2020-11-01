import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";
import {IKFDomain} from "../Context/IKFDomain";
import {KFBlockTarget} from "../Context/KFBlockTarget";
import {KFDName} from "../../KFData/Format/KFDName";
import {KFGraphBlockBase} from "../Graph/Blocks/KFGraphBlockBase";
import {KFActor} from "../Actor/KFActor";


///增加图形事件的支持
export class BlockListener
{
    ///离线数据
    public selfSID:number;
    public blockName:KFDName;

    ///运行时数据
    public self:KFBlockTarget;
    public block:KFGraphBlockBase;

    public constructor(self:KFBlockTarget = null, block:KFGraphBlockBase = null)
    {
        this.self = self;
        this.block = block;
    }

    public Equal(self:KFBlockTarget, block:KFGraphBlockBase):boolean
    {
        if(this.self){
            return this.self == self && this.block == block;
        }else{
            return self.sid == this.selfSID && block.data.name.value == this.blockName.value;
        }
    }
}

export class KFEventDispatcher extends KFEventTable
{
    private m_domain:IKFDomain;
    private m_blocklisteners:{[key:number]: BlockListener[];} = {};
    private m_fireType:KFDName;
    private m_delayRemoves:BlockListener[] = [];

    public constructor(domain:IKFDomain)
    {
        super();
        this.m_domain = domain;
    }

    public Clear() {
        super.Clear();
        this.m_fireType = null;
        this.m_blocklisteners = {};
        this.m_delayRemoves = [];
    }

    public AddBlockListener(type:KFDName, self:KFBlockTarget, block:KFGraphBlockBase)
    {
        let listeners = this.m_blocklisteners[type.value];
        if(listeners == null){
            listeners = [];
            this.m_blocklisteners[type.value] = listeners;
        }
        listeners.push(new BlockListener(self, block));
    }

    public RemoveBlockListener(type:KFDName, self:KFBlockTarget, block:KFGraphBlockBase)
    {
        if(this.m_fireType && this.m_fireType.value == type.value)
        {
            this.m_delayRemoves.push(new BlockListener(self, block));
            return;
        }

        let listeners = this.m_blocklisteners[type.value];
        if(listeners){


            let index = listeners.length - 1;
            while(index >= 0)
            {
                if(listeners[index].Equal(self, block))
                {
                    listeners.splice(index, 1);
                    break;
                }
                index -= 1;
            }
        }
    }

    public HasBlockListener(type:KFDName, self:KFBlockTarget, block:KFGraphBlockBase):boolean
    {
        let listeners = this.m_blocklisteners[type.value];
        if(listeners){
            for(let bl of listeners){
                if(bl.Equal(self, block)){
                    return true;
                }
            }
        }
        return false;
    }


    public FireEvent(event:KFEvent):void
    {
        super.FireEvent(event);

        let listeners = this.m_blocklisteners[event.type.value];
        if(listeners)
        {
            this.m_fireType = event.type;
            let count: number = listeners.length;
            for (let i = 0; i < count; i++)
            {
                let bl:BlockListener = listeners[i];
                let block:KFGraphBlockBase = bl.block;
                let blself:KFActor = <any>bl.self;

                if(block == null)
                {
                    if(!blself)
                    {
                        blself = <any>this.m_domain.GetBlockTarget(bl.selfSID);
                        bl.self = blself;
                    }
                    if(blself)
                    {
                        bl.block = block = blself.graph.GetBlock(bl.blockName);
                    }
                }

                if(block) {block.OnEvent(event, blself);}
            }


            let removeType = this.m_fireType;
            this.m_fireType = null;

            if(this.m_delayRemoves.length > 0)
            {
                for(let listener of this.m_delayRemoves)
                {
                    this.RemoveBlockListener(removeType, listener.self,listener.block);
                }

                this.m_delayRemoves.length = 0;
            }
        }
    }
}