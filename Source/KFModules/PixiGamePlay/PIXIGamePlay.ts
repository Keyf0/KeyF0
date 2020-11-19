
import {KFDTable} from "../../KFData/Format/KFDTable";
import {PIXIApplication} from "./PIXIApplication";
import {PIXIMovieClip} from "./PIXIMovieClip";
import {PIXINetActor} from "./PIXINetActor";
import {PIXIScene} from "./PIXIScene";
import {PIXIGraphics} from "./PIXIGraphics";
import {ScriptMeta} from "../../ACTS/Script/KFScriptFactory";
import {GSCreateBLK, TSControlMove, TSSmoothMove} from "./Scripts/PIXIScripts";
import {KFDataHelper} from "../../ACTS/Data/KFDataHelper";
import {PIXIAnimatedSprite} from "./PIXIAnimatedSprite";
import {PIXIAssetLoader} from "./PIXIAssetLoader";
import {PIXICamera} from "./PIXICamera";
import {PIXISceneGrid} from "./PIXISceneGrid";
import {PIXIShapes, PIXIShapesData} from "./PIXIShapes";
import {PlanckDebugGraphics} from "./PlanckDebugGraphics";
import {EditPIXIObject} from "./Edit/EditPIXIObject";
import {EditPIXIShapes} from "./Edit/EditPIXIShapes";
import * as BABYLON from "babylonjs";
import {EditPIXIMovieClip} from "./Edit/EditPIXIMovieClip";

///初始化
export function init() {
    PIXIApplication;
    PIXIMovieClip;
    PIXINetActor;
    PIXIScene;
    PIXIGraphics;
    PIXIAnimatedSprite;
    PIXIShapes;
    PIXIAssetLoader;
    PIXICamera;
    PIXISceneGrid;
    PlanckDebugGraphics;


    EditPIXIObject;
    EditPIXIShapes;
    EditPIXIMovieClip;
}

export function initKFDTable(kfdtb:KFDTable) {

    ///注册所有脚本数据的初始化
    KFDataHelper.InitSD(
        [
              TSSmoothMove.Meta
            , TSControlMove.Meta
            , GSCreateBLK.Meta
        ]
        ,kfdtb
    );
}