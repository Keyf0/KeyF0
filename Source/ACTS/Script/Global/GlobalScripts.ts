import {KFScript, KFScriptContext} from "../../../KFScript/KFScriptDef";
import {ScriptMeta} from "../KFScriptFactory";

export class GSPlayStateScript extends KFScript
{
    public static Meta:ScriptMeta = new ScriptMeta("GSPlayStateScriptData",():KFScript=>{
        return new GSPlayStateScript();
    })

    public Execute(scriptdata: any, context: KFScriptContext = null): void
    {
        if(scriptdata.action == 0){
            context.targetObject.timeline.Play(scriptdata.stateid);
        }
        else{
                context.targetObject.timeline.playing = false;
            }
    }
}