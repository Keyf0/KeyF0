import {PIXINetActor} from "./PIXINetActor";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {kfVector3} from "../../ACTS/Script/Global/GlobalScripts";


///KFD(C,CLASS=PIXIScene,EXTEND=PIXINetActor)
///KFD(P=1,NAME=sortZTime,CNAME=刷新Z时间,TYPE=num1,DEFAULT=0)
///KFD(*)

export class PIXIScene extends PIXINetActor
{
    public static Meta:IKFMeta = new IKFMeta("PIXIScene"
        ,():KFBlockTarget=>{
            return new PIXIScene();
        }
    );

    public target:PIXI.Container;
    public sortZTime:number;

    private _sortTime:number;
    private _enablesort:boolean;

    protected newContainer(): PIXI.Container {

        this.target = new PIXI.Container();
        ///可排序
        ///this.target.sortableChildren = true;

        this.sortZTime = 500;
        if(this.sortZTime) {
            this._enablesort = true;
            this._sortTime = 0;
        }

        return this.target;
    }


    public Tick(frameindex: number): void {
        super.Tick(frameindex);
        if(this._enablesort){
            let rtime = this.runtime.realytime;
            if(rtime - this._sortTime >= this.sortZTime){
                this._sortTime = rtime;
                if(this.target.sortDirty) {
                    this.target.sortChildren();
                }
            }
        }
    }
}