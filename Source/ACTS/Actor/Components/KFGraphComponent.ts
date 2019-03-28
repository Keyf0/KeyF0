import {KFComponentBase} from "./KFComponentBase";
import {KFDName} from "../../../KFData/Format/KFDName";
import {IKFGraphContext} from "../../Graph/IKFGraphContext";
import {IKFBlockTargetContainer} from "../../Context/KFBlockTarget";
import {KFEventTable} from "../../../Core/Misc/KFEventTable";
import {KFScriptContext} from "../../../KFScript/KFScriptDef";
import {KFGraph} from "../../Graph/KFGraph";

export class KFGraphComponent extends KFComponentBase implements IKFGraphContext
{
    public static Meta:KFDName
        = new KFDName("KFGraphComponent");

    public IsEditing: boolean;
    public container: IKFBlockTargetContainer;
    public etable: KFEventTable;

    private m_cfg:any;
    private m_graph:KFGraph;
    private m_inputregister:any;

    public constructor(target:any)
    {
        super(target, KFGraphComponent.Meta.value);
        this.m_graph = new KFGraph(this);
    }

    public ReleaseComponent()
    {
        this.m_graph.Release();
    }

    public ResetComponent()
    {
        this.m_graph.Reset();
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.model.path);
        this.m_graph.SetConfig(this.m_cfg);
        this.m_graph.Play();
    }

    public ActivateComponent()
    {
        this.m_graph.Activate(this.model.sid);
        this.m_cfg = this.runtime.configs.GetGraphConfig(this.model.path);
        this.m_graph.SetConfig(this.m_cfg);
        this.m_graph.Play();
    }

    public DeactiveComponent()
    {
        this.m_cfg = null;
        this.m_graph.Deactive();
    }

    public EnterFrame(){this.m_graph.Tick();}
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

    public SetInputRegister(value: any)
    {
        this.m_inputregister = value;
    }

    public GetInputRegister():any{return this.m_inputregister;}

    public OnGraphFrame(arg: any
                 , frame: any
                 , scriptContext: KFScriptContext)
    {
        this.targetObject.script.ExecuteFrameScript(0
            , frame,scriptContext);
    }

    public OnGraphOutput(blockname: KFDName, arg: any)
    {
        this.targetObject.FireGraphOutput(blockname, arg);
    }

    public Input(blockname:KFDName
                 , arg:any)
    {
        this.m_graph.Input(blockname, arg);
    }

    public ExecuteBlock(blockname:KFDName, arg:any)
    {
        this.m_graph.ExecuteBlock(blockname, arg);
    }
}