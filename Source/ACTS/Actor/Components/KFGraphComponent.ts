import {KFComponentBase} from "./KFComponentBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {IKFGraphContext} from "../../Graph/IKFGraphContext";
import {IKFBlockTargetContainer, KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFEventTable} from "../../../Core/Misc/KFEventTable";
import {KFScriptContext} from "../../../KFScript/KFScriptDef";
import {KFGraph} from "../../Graph/KFGraph";
import {IKFMeta} from "../../../Core/Meta/KFMetaManager";

export class KFGraphComponent extends KFComponentBase implements IKFGraphContext
{
    public static Meta:IKFMeta
        = new IKFMeta("KFGraphComponent");

    public IsEditing: boolean = false;

    private m_cfg:any;
    public m_graph:KFGraph;

    public constructor(target:any)
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
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.targetObject.metadata.asseturl);
        this.m_graph.SetConfig(this.m_cfg);
        this.m_graph.Play();
    }

    public ActivateComponent()
    {
        this.m_graph.Activate(this.targetObject.sid);
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.targetObject.metadata.asseturl);
        this.m_graph.SetConfig(this.m_cfg);
        this.m_graph.Play();
    }

    public DeactiveComponent()
    {
        this.m_cfg = null;
        this.m_graph.Deactive();
    }

    public EnterFrame()
    {
        this.m_graph.Tick(this.runtime.frameindex);
    }

    public SetEditing(value:boolean)
    {
        this.IsEditing = value;
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