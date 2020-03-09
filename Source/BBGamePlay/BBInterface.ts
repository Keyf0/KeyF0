import * as BABYLON from "babylonjs";
import {AMeta, InstantiateFunc, KFMetaManager} from "../Core/Meta/KFMetaManager";
import {KFDName} from "../KFData/Format/KFDName";

export interface IBBObject
{
    scene:BABYLON.Scene;
}

export class BBMeta extends AMeta{
    SetDefaultFactroy(name: string, func: InstantiateFunc = null) {
        super.SetDefaultFactroy(name, func);
        BBObjectFactory.Register(this);
    }
}


export class BBObjectFactory
{
    private static _Inst:KFMetaManager = new KFMetaManager(2000000,"BABYLONMeta");

    public static Register(meta:BBMeta):boolean
    {
        return BBObjectFactory._Inst._Register(meta);
    }

    public static GetMetaType(type:number):BBMeta
    {
        return BBObjectFactory._Inst._GetMetaType(type);
    }

    public static GetMetaName(name:KFDName):BBMeta
    {
        return BBObjectFactory._Inst._GetMetaName(name);
    }
}