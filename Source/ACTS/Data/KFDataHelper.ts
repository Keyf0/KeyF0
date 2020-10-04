import {KFDTable} from "../../KFData/Format/KFDTable";
import {
    GSExpressionScript,
    GSLoadBLKDataScript,
    GSLogScript,
    GSPlayStateScript,
    GSRemoteScript,
    GSSaveBLKDataScript,
    kfVector3,
    SDAnyRef,
    SDArray,
    SDBLKVars,
    SDBlockTarget,
    SDBlockTargetRef,
    SDBool,
    SDFloat, SDFloatArray,
    SDInt32, SDInt32Array,
    SDNewBlkDataList,
    SDString, SDStringArray
} from "../Script/Global/GlobalScripts";
import {ScriptMeta} from "../Script/KFScriptFactory";
import {KFExpression} from "../Script/Global/KFExpression";
import {KFScript, KFScriptData} from "../../KFScript/KFScriptDef";
import {KFScriptGroupType} from "../../KFScript/KFScriptGroupType";
import {KFDataTable} from "../Context/KFDataTable";

export class KFDataHelper
{
    public static Meta2MapValue(meta:any) : {[key:string]:string;}
    {
        let mapvalues:{[key:string]:string;} = {};
        if(meta && meta.fields && meta.fields.items)
        {
            let items = meta.fields.items;
            for(let i = 0 ; i < items.length; i ++)
            {
                let itemobj = items[i];
                mapvalues[itemobj.key] = itemobj.value;
            }
        }
        return mapvalues;
    }

    public static InitSD(SMetas:ScriptMeta[],kfdtable:KFDTable){

        for(let i = 0;i < SMetas.length;i ++) {
            let meta:ScriptMeta = SMetas[i];
            let kfd = kfdtable.get_kfddata(meta.name.toString());
            if (kfd) {
                kfd.__new__ = meta.DataNew;
            }
            KFScriptData.RFS[meta.name.value] = meta.RS;
        }
    }

    public static InitAfterKFDTable(kfdtable:KFDTable)
    {
        KFDataTable;
        ///注册所有脚本数据的初始化
        KFDataHelper.InitSD([
            GSPlayStateScript.Meta
            , GSLogScript.Meta
            , GSExpressionScript.Meta
            , GSRemoteScript.Meta
            , GSSaveBLKDataScript.Meta
            , GSLoadBLKDataScript.Meta

            ///定义一些基本的数据结构
                , new ScriptMeta("SDVector3"
                    ,():KFScript=>{return null;}
                    , KFScriptGroupType.Global
                    ,()=>{
                        return new kfVector3();
                    })
                , new ScriptMeta("SDFloat"
                    ,():KFScript=>{return null;}
                    , KFScriptGroupType.Global
                    ,()=>{
                    return new SDFloat();
                })

                , new ScriptMeta("SDInt32"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDInt32();
                })

                , new ScriptMeta("SDString"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDString();
                })

                , new ScriptMeta("SDBool"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDBool();
                })

                , new ScriptMeta("SDArray"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDArray();
                })

                , new ScriptMeta("SDStringArray"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDStringArray();
                })

                , new ScriptMeta("SDFloatArray"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDFloatArray();
                })

                , new ScriptMeta("SDInt32Array"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDInt32Array();
                })

                , new ScriptMeta("SDNewBlkDataList"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDNewBlkDataList();
                })

                , new ScriptMeta("SDBLKVars"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDBLKVars();
                })

                , new ScriptMeta("SDBlockTarget"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDBlockTarget();
                })
                , new ScriptMeta("SDBlockTargetRef"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDBlockTargetRef();
                })
                , new ScriptMeta("SDAnyRef"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,()=>{
                    return new SDAnyRef();
                })
            ]
            ,kfdtable);

        let KFExpressionKFD = kfdtable.get_kfddata("KFExpression");
        KFExpressionKFD.__new__ = function() {
            return new KFExpression();
        }

        let kfV3KFD = kfdtable.get_kfddata("kfVector3");
        kfV3KFD.__new__ = function(){return new kfVector3();}

        ///默认初始化KFFrameData
        let KFFrameDataKFD = kfdtable.get_kfddata("KFFrameData");
        KFFrameDataKFD.__init__ = {func:function(data, kfd, kfdtb)
            {
                data.index = 0;
                data.once = false;
                data.startPC = 0;
                data.varsize = 3;
                data.paramsize = 0;
        }};
    }
}