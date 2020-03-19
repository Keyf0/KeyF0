import {KFActor} from "../../ACTS/Actor/KFActor";
import * as BABYLON from 'babylonjs';
import {BBObjectFactory, IBBObject} from "./BBInterface";
import {KFDataHelper} from "../../ACTS/Data/KFDataHelper";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";


///KFD(C,CLASS=BBNode,EXTEND=KFActor)
///KFD(*)

export class BBNode extends KFActor implements IBBObject
{
    public static Meta:IKFMeta = new IKFMeta("BBNode"

        ,():KFBlockTarget=>{
            return new BBNode();
        }
    );

    public target:BABYLON.Node;
    public scene:BABYLON.Scene;

    public CreateTarget(KFBlockTargetData: any):BABYLON.Node
    {
        ///targetClass是目标的类名
        let Values:{[key:string]:string;} = KFDataHelper.Meta2MapValue(this.metadata);
        if(Values.targetJS)
        {
            ///可以用脚本来创建
            let name = KFBlockTargetData.instname;
            let scene = this.scene;
            this.target = eval(Values.targetJS);
        }
        else if(Values.targetClass)
        {
            let meta:IKFMeta = BBObjectFactory.GetMetaName(
                KFDName._Param.setString(Values.targetClass)
            );
           if(meta)
           {
               let param = null;
               if(Values.targetParam)
               {
                   param = JSON.parse(Values.targetParam);
               }
               this.target = meta.instantiate(KFBlockTargetData.instname, this.scene, param);
           }
        }

        return this.target;
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        let obj = <IBBObject><any>this.parent;
        this.scene  = obj.scene;
        this.target = this.CreateTarget(KFBlockTargetData);
    }

    public DeactiveBLK(): void
    {
        super.DeactiveBLK();

        if(this.target)
        {
            this.target.dispose();
            this.target = null;
        }

        this.scene = null;
    }
}