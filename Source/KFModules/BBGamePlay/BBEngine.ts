import {HCanvas} from "../Web/HCanvas";
import * as BABYLON from 'babylonjs';
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=BBEngine,EXTEND=HCanvas)
///KFD(*)


export class BBEngine extends HCanvas
{
    public static Meta:IKFMeta = new IKFMeta("BBEngine"

        ,():KFBlockTarget=>{
            return new BBEngine();
        }
    );

    public _target:BABYLON.Engine;

    protected TargetNew(KFBlockTargetData: any): void
    {
        super.TargetNew(KFBlockTargetData);

        let self = this;
        let domele:HTMLCanvasElement = <HTMLCanvasElement>this.target;
        this._target = new BABYLON.Engine(domele);

        window.addEventListener('resize', function () {
            self._target.resize();
        });
    }
}