import {KFComponentBase} from "./KFComponentBase";
import {IKFGraphContext} from "../../Graph/IKFGraphContext";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFScriptContext} from "../../../KFScript/KFScriptDef";
import {KFGraph} from "../../Graph/KFGraph";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";

export class KFGraphComponent extends KFComponentBase implements IKFGraphContext
{
    public static Meta:IKFMeta
        = new IKFMeta("KFGraphComponent");

    private m_cfg:any;

    public m_graph:KFGraph;
    public script: KFScriptContext;

    public constructor(target:KFBlockTarget)
    {
        super(target, KFGraphComponent.Meta.type);
        this.m_graph = new KFGraph(this);
    }

    public ReleaseComponent()
    {
        this.m_graph.Release();
    }

    public ResetComponent()
    {
        this.m_graph.Reset();
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.targetObject.metadata.asseturl,false);
        this.m_graph.SetConfig(this.m_cfg);
        this.m_graph.Play();
    }

    public ActivateComponent()
    {
        this.script = this.runtime.scripts;
        this.m_graph.Activate(this.targetObject.sid);
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.targetObject.metadata.asseturl,false);
        this.m_graph.SetConfig(this.m_cfg);
        this.m_graph.Play();
    }

    public DeactiveComponent()
    {
        this.m_cfg = null;
        this.m_graph.Deactive();
    }

    public Play():void
    {
        this.m_graph.Play();
    }

    public Stop():void
    {
        this.m_graph.Stop();
    }
}