import {KFActor} from "../../ACTS/Actor/KFActor";
import * as BABYLON from 'babylonjs';
import {BBEngine} from "./BBEngine";
import {IBBObject} from "./BBInterface";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

///KFD(C,CLASS=BBScene,EXTEND=KFActor)
///KFD(*)

export class BBScene extends KFActor implements IBBObject
{
    public static Meta:IKFMeta = new IKFMeta("BBScene"

        ,():KFBlockTarget=>{
            return new BBScene();
        }
    );

    public target:BABYLON.Scene;
    public scene:BABYLON.Scene;
    public engine:BABYLON.Engine;
    public renderThread:any = null;

    protected TargetNew(KFBlockTargetData: any): any
    {
        let bbengine = <BBEngine><any>this.parent;
        this.engine = bbengine._target;
        this.target = this.CreateTarget(this.engine);
        this.scene = this.target;
    }

    protected TargetDelete()
    {
        if(this.target)
        {
            this.target.getEngine().stopRenderLoop(this.renderThread);
            this.renderThread = null;
            this.target.dispose();
            this.target = null;
        }
    }

    public CreateTarget(engine:BABYLON.Engine):BABYLON.Scene
    {
        return new BABYLON.Scene(engine);
    }


    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);
        let self = this;
        this.renderThread = () =>
        {
            self.scene.render();
        };
        this.engine.runRenderLoop(this.renderThread);
    }
}