import {KFActor} from "../ACTS/Actor/KFActor";
import * as BABYLON from 'babylonjs';
import {BBEngine} from "./BBEngine";
import {IBBObject} from "./BBInterface";
import {IKFMeta} from "../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../ACTS/Context/KFBlockTarget";

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
    public renderThread:any = null;

    public ActivateBLK(KFBlockTargetData: any): void
    {
        let engine = <BBEngine><any>this.parent;
        this.target = this.CreateTarget(engine._target);
        this.scene = this.target;
        super.ActivateBLK(KFBlockTargetData);
        let self = this;
        this.renderThread = () =>
        {
            self.scene.render();
        };

        engine._target.runRenderLoop(this.renderThread);
    }

    public DeactiveBLK(): void {
        super.DeactiveBLK();
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
}