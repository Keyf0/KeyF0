import {BBMeta} from "./BBInterface";
import * as BABYLON from "babylonjs";
import {KFDTable} from "../../KFData/Format/KFDTable";
import {BBEngine} from "./BBEngine";
import {BBNode} from "./BBNode";
import {BBScene} from "./BBScene";

///KFD(C,CLASS=BABYLON.Node)
///KFD(P=1,NAME=position,TYPE=object,OTYPE=BABYLON.Vector3)
///KFD(P=2,NAME=rotation,TYPE=object,OTYPE=BABYLON.Vector3)
///KFD(P=3,NAME=scaling,TYPE=object,OTYPE=BABYLON.Vector3)
///KFD(*)

///KFD(C,CLASS=BABYLON.FreeCamera,EXTEND=BABYLON.Node)
///KFD(*)

///KFD(C,CLASS=BABYLON.HemisphericLight,EXTEND=BABYLON.Node)
///KFD(*)

///KFD(C,CLASS=BABYLON.Sphere,EXTEND=BABYLON.Node)
///KFD(*)

///KFD(C,CLASS=BABYLON.Ground,EXTEND=BABYLON.Node)
///KFD(*)


new BBMeta("BABYLON.FreeCamera",(...args:any[])=>{

    let pos = new BABYLON.Vector3(0, 0, 0);
    let param = args[2];

    if(param && (param instanceof BABYLON.Vector3) == false)
    {
        pos.set(param.x,param.y,param.z);
    }
    else pos = param;
    let scene:BABYLON.Scene = args[1];

    return new BABYLON.FreeCamera(args[0], pos, scene);
});

new BBMeta("BABYLON.HemisphericLight",(...args:any[])=>{
   return new BABYLON.HemisphericLight(args[0], new BABYLON.Vector3(0 , 1, 0), args[1]);
});

new BBMeta("BABYLON.Sphere",(...args:any[])=>{
    return BABYLON.MeshBuilder.CreateSphere(args[0],
        args[2] ? args[2] :{segments: 16, diameter: 1}, args[1]);
});

new BBMeta("BABYLON.Ground",(...args:any[])=>{
    return BABYLON.MeshBuilder.CreateGround(args[0],
        args[2] ? args[2] : {width: 6, height: 6, subdivisions: 2}
        , args[1]);
});

///初始化
export function init()
{
    BBEngine;
    BBScene;
    BBNode;
}

export function initKFDTable(kfdtb:KFDTable)
{

}