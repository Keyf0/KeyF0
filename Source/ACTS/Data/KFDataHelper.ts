import {KFDTable} from "../../KFData/Format/KFDTable";
import {GSExpressionScript, GSLogScript, GSPlayStateScript, GSRemoteScript} from "../Script/Global/GlobalScripts";
import {ScriptMeta} from "../Script/KFScriptFactory";
import {KFExpression} from "../Script/Global/KFExpression";
import {KFScript, KFScriptData} from "../../KFScript/KFScriptDef";
import {KFScriptGroupType} from "../../KFScript/KFScriptGroupType";
import {KFDName} from "../../KFData/Format/KFDName";
import {LOG} from "../../Core/Log/KFLog";

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

        for(let i = 0;i < SMetas.length;i ++)
        {
            let meta:ScriptMeta = SMetas[i];
            let kfd = kfdtable.get_kfddata(meta.name.toString());
            if (kfd) {
                kfd.__init__ = {func: meta.DataInit};
            }
            KFScriptData.RFS[meta.name.value] = meta.RS;
        }
    }

    public static InitAfterKFDTable(kfdtable:KFDTable)
    {
        ///注册所有脚本数据的初始化
        KFDataHelper.InitSD([
            GSPlayStateScript.Meta
            , GSLogScript.Meta
            , GSExpressionScript.Meta
            , GSRemoteScript.Meta

            ///定义一些基本的数据结构
                , new ScriptMeta("SDVector3"
                    ,():KFScript=>{return null;}
                    , KFScriptGroupType.Global
                    ,(data, kfd, kfdtb)=>{
                        data.x = 0;data.y = 0;data.z = 0;
                        data.setValue = function (v3) {this.x = v3.x;this.y=v3.y;this.z=v3.z;};
                        data.getValue = function (copy) {
                            if(copy){ return {x:this.x,y:this.y,z:this.z} } else return this;
                        };
                        data.add = function (v3) {this.x+= v3.x;this.y+=v3.y;this.z+=v3.z;}
                        data.sub = function (v3)
                        {
                            this.x-= v3.x;this.y-=v3.y;this.z-=v3.z;
                        }
                        data.mul = function (d) { this.x *= d;this.y *= d;this.z *= d;}
                        data.nor = function () {
                            let lens = this.x * this.x + this.y * this.y + this.z * this.z;
                            if(lens > 0){
                                let srate = 1 / Math.sqrt(lens);
                                this.x *= srate; this.y*= srate; this.z*=srate;
                            }else{
                                this.x=0;this.y=0;this.z=0;
                            }
                        }
                    })
                , new ScriptMeta("SDFloat"
                    ,():KFScript=>{return null;}
                    , KFScriptGroupType.Global
                    ,(data, kfd, kfdtb)=>{
                    data.value = 0;
                    data.setValue = function (v)
                    {
                        if(isNaN(v)) {
                            this.value = v.getValue();
                        }
                            else this.value = v;
                    };
                    data.getValue = function () {return this.value;};
                    data.add = function (vo)
                    {
                        let v = vo;
                        if(isNaN(vo)){v = vo.getValue();}
                        this.value += v;
                    }
                    data.sub = function (vo) {
                        let v = vo;
                        if(isNaN(vo)){v = vo.getValue();}
                        this.value -= v;
                    }
                    data.mul = function (vo)
                    {
                        let v = vo;
                        if(isNaN(vo)){v = vo.getValue();}
                        this.value *= v;
                    }
                })

                , new ScriptMeta("SDInt32"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,(data, kfd, kfdtb)=>{
                    data.value = 0;
                    data.setValue = function (v)
                    {
                        if(isNaN(v)) {
                            this.value = v.getValue();
                        }
                        else this.value = v;
                    };
                    data.getValue = function () {return this.value;};
                    data.add = function (vo)
                    {
                        let v = vo;
                        if(isNaN(vo)){v = vo.getValue();}
                        this.value += v;
                    }
                    data.sub = function (vo) {
                        let v = vo;
                        if(isNaN(vo)){v = vo.getValue();}
                        this.value -= v;
                    }
                    data.mul = function (vo)
                    {
                        let v = vo;
                        if(isNaN(vo)){v = vo.getValue();}
                        this.value *= v;
                    }
                })

                , new ScriptMeta("SDString"
                ,():KFScript=>{return null;}
                , KFScriptGroupType.Global
                ,(data, kfd, kfdtb)=>{
                    data.value = "";
                    data.setValue = function (v)
                    {   if(typeof(v) != "string") {
                            this.value = v.getValue();
                        }
                        else this.value = v;};
                    data.getValue = function () {return this.value;};
                    data.add = function (vo)
                    {let v = vo;
                        if(typeof(v) != "string"){v = vo.getValue();}
                        this.value += v;}
                })
            ]
            ,kfdtable);

        let KFExpressionKFD = kfdtable.get_kfddata("KFExpression");
        KFExpressionKFD.__new__ = function()
        {
            return new KFExpression();
        }

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