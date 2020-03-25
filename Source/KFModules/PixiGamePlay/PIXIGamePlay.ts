
import {KFDTable} from "../../KFData/Format/KFDTable";
import {PIXIApplication} from "./PIXIApplication";
import {PIXIMovieClip} from "./PIXIMovieClip";
import {PIXINetActor} from "./PIXINetActor";
import {PIXIScene} from "./PIXIScene";
import {PIXIGraphics} from "./PIXIGraphics";
import {ScriptMeta} from "../../ACTS/Script/KFScriptFactory";
import {TSControlMove, TSSmoothMove} from "./Scripts/PIXIScripts";
import {KFDataHelper} from "../../ACTS/Data/KFDataHelper";

///初始化
export function init() {
    PIXIApplication;
    PIXIMovieClip;
    PIXINetActor;
    PIXIScene;
    PIXIGraphics;
}

export function initKFDTable(kfdtb:KFDTable) {

    ///注册所有脚本数据的初始化
    KFDataHelper.InitSD(
        [
              TSSmoothMove.Meta
            , TSControlMove.Meta
        ]
        ,kfdtb
    );
}