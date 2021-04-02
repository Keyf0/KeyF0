import {IKFTimelineContext} from "./IKFTimelineProc";
import {KFBlockTargetOption} from "../Data/KFBlockTargetOption";
import {KFActor} from "../Actor/KFActor";
import {KFBlockTarget} from "../Context/KFBlockTarget";
import {KFDName} from "../../KFData/Format/KFDName";

export class KFTimeBlock
{
    private m_keyframes:{[key:number]:any};

    public data:any;
    public keep:boolean;
    public option:number;
    public opoption:number;

    public newName:KFDName;
    public id:number;

    public Create(ctx:IKFTimelineContext, data:any, blockid:number)
    {
        this.id = blockid;
        this.SetData(data);
    }

    public Destroy()
    {

    }

    public SetData(data:any)
    {
        this.data = data;
        this.option = data.target.option;
        this.opoption = data.opOption;
        this.m_keyframes = {};

        let keyframes = data.keyframes;
        let blocklength = data.end - data.begin;

        ///暂时保持和C++版本一致后面需要同时优化下
        ///H5编辑器保证关键帧的顺序
        // if(!keyframes["__order__"])
        // {
        //    keyframes.sort((a,b)=> {return a.id - b.id});
        //    keyframes["__order__"] = true;
        // }

        let preframe = null;
        if(keyframes) {
            let begini = data.begin;

            for (let keyframe of keyframes) {
                this.m_keyframes[keyframe.id] = keyframe;
                if (keyframe != null) {
                    if (preframe != null)
                        preframe["__next__"] = keyframe;
                    preframe = keyframe;
                }
            }
        }

        if(preframe != null)
        {
            preframe["__next__"] = null;
        }

    }

    public Tick(self:KFActor, frameIndex:number, bJumpFrame:boolean)
    {
        if(this.option == KFBlockTargetOption.Disabled)
            return;

        let endi = this.data.end;
        if( frameIndex >= this.data.begin &&  frameIndex < endi)
        {
            frameIndex -= this.data.begin;
            let m_target:KFBlockTarget = this.Activate(self);
            this.TickInternal(self, m_target, frameIndex, bJumpFrame);
        }
        else if(this.option == KFBlockTargetOption.Create)
        {
            let m_target:KFBlockTarget = this.Activate(self,true);
            if(m_target && m_target.display != -1)
            {
                m_target.set_display(-1, bJumpFrame);
            }
        }
    }

    ///简单判定另开一个函数处理直接显示逻辑
    public DisplayFrame(self:KFActor, frameIndex:number, bJumpFrame:boolean)
    {
        let bdata = this.data;
        let endi = bdata.end;
        let bgi = bdata.begin;

        if( frameIndex >= bgi &&  frameIndex < endi)
        {
            frameIndex -= bgi;
            let m_target = this.Activate(self);
            if(m_target)
            {
                let keyframe = this.m_keyframes[frameIndex];
                if (keyframe) {
                    if (this.opoption != 0) {
                        m_target.set_display(keyframe.display,bJumpFrame);
                        m_target.set_datas(keyframe.values);
                    }
                } else if (bJumpFrame) {

                    let prevFrameIndex = frameIndex - 1;
                    while (prevFrameIndex >= 0) {
                        keyframe = this.m_keyframes[prevFrameIndex];
                        if (keyframe) {
                            if (this.opoption != 0) {
                                m_target.set_display(keyframe.display, bJumpFrame);
                                m_target.set_datas(keyframe.values);
                            }
                            break;
                        }
                        --prevFrameIndex;
                    }
                }
            }
        }else{
            let m_target:KFBlockTarget = this.Activate(self,true);
            if(m_target && m_target.display != -1)
            {
                m_target.set_display(-1, bJumpFrame);
            }
        }
    }


    private PushKeyFrame(self:KFActor, target: KFBlockTarget, keyframe: any): void
    {
        if(self.tlProcSize >= self.tlProcKeyFrames.length)
        {
            self.tlProcKeyFrames.push({target:target,keyframe:keyframe});
        }
        else
        {
            let info = self.tlProcKeyFrames[self.tlProcSize];
            info.target = target;
            info.keyframe = keyframe;
        }

        self.tlProcSize += 1;
    }

    private TickInternal(self:KFActor, target:KFBlockTarget ,frameIndex:number, bJumpFrame:boolean)
    {
        target.visible = true;

        let keyframe = this.m_keyframes[frameIndex];
        if (keyframe) {
            this.PushKeyFrame(self, target, keyframe);
            if(this.opoption != 0) {
                target.set_display(keyframe.display, bJumpFrame);
                target.set_datas(keyframe.values);
            }
        }
        else if (bJumpFrame) {

            let prevFrameIndex = frameIndex - 1;
            while (prevFrameIndex >= 0) {
                keyframe = this.m_keyframes[prevFrameIndex];
                if (keyframe) {
                    if(this.opoption != 0) {
                        target.set_display(keyframe.display, bJumpFrame);
                        target.set_datas(keyframe.values);
                    }
                    break;
                }
                --prevFrameIndex;
            }
        }
    }

    private InitRename(parent:KFActor, target:KFBlockTarget)
    {
        let name:KFDName = target.name;

        if(this.newName) {
            if(name.value != this.newName.value) {
                target.name = this.newName;
            }
        }else {

            if (parent.FindChild(name.value) != null) {
                if (this.newName == null) {
                    let namestr = name.toString() + "_" + this.id;
                    this.newName = new KFDName(namestr);
                }

                target.name = this.newName;
            } else {
                    this.newName = name;
            }
        }
    }

    private Activate(self:KFActor, search:boolean = false):KFBlockTarget
    {
        let targetdata = this.data.target;
        let target:KFBlockTarget = null;

        if (this.option == KFBlockTargetOption.Create)
        {
            ///search 就不创建目标了
            target = this.newName ? self.FindChild(this.newName.value) : null;

            if(target == null && false == search)
            {
                ///创建一个对象但是有可能名字用一个重新命的名字，不允许重复
                target = self.CreateChild(targetdata, null
                    , this.InitRename.bind(this,self));
            }
        }
        else if (this.option == KFBlockTargetOption.Attach) {
            target = self.FindChild(targetdata.instname);
        } else {
            ///是自己
            target = self;
        }
        return target;
    }

    public Deactive(self:KFActor, force:boolean = false)
    {
        let m_target = this.Activate(self, true);
        if (m_target != null)
        {
            //LOG_WARNING("%s", m_data->label.c_str());
            if (this.option == KFBlockTargetOption.Create)
            {
                self.DeleteChild(m_target);
            }
        }
    }
}