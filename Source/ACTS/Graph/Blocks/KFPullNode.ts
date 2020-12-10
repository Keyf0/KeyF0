import {KFGraphBlockBase, PullRequest} from "../Blocks/KFGraphBlockBase";
import {KFBlockTarget} from "../../Context/KFBlockTarget";
import {KFDName} from "../../../KFData/Format/KFDName";
import {KFActor} from "../../Actor/KFActor";
import {KFBlockTargetOption} from "../../Data/KFBlockTargetOption";
import {KFTargetScript} from "../../Script/KFScriptSystem";
import {IKFGraphContext} from "../IKFGraphContext";
import {GRAPH_NAME_INPUT, GRAPH_STRING_OUTPUT} from "../../Data/KFGraphBlockType";

export class PullNodeExecutor extends KFTargetScript
{
    protected m_node:KFPullNode;
    protected m_usingExecute:boolean;

    ///输入的版本号
    protected m_inputVersions:number[] = [];
    ///输入的数据
    protected m_inputDatas:any[] = [];
    ///请求还回版本号
    protected m_requestVersions:number[];
    ///请求的数量
    protected m_requestCount:number;

    protected m_outVersion:number;
    protected m_outData:any;

    ///等待响应
    protected m_waitResponse:PullRequest[] = [];

    public constructor(node:KFPullNode,target:KFActor)
    {
        super(true);

        this.isrunning = true;

        let fd = node.data.frame;
        let scripts = fd ? fd.scripts : null;
        this.m_usingExecute = (scripts && scripts.length > 0);

        this.m_t = target;
        this.m_node = node;
        this.m_outVersion = 0;
        this.m_outData = this.m_usingExecute ? target.NewNodeData() : null;

        this.type = node.data.name;
    }

    public Execute0(inputDatas: any[])
    {
        let self:KFBlockTarget = this.m_t;
        let node = this.m_node;
        let fd = node.data.frame;

        let script = self.runtime.scripts;
        ///填充第一位寄存器 需要先保存之前的参数
        ///执行完后再填充
        let OBJS = script._reg._OBJECTS;

        let inputCount = inputDatas ? inputDatas.length : 0;
        let ArgStacks:any[];
        if(inputCount > 0) {
            ArgStacks = [];
            for(let i = 0;i < inputCount; i ++) {
                ArgStacks.push(OBJS[i]);
                OBJS[i] = inputDatas[i];
            }
        }
        let bcache = script.block;

        let bcurr = bcache.current;
        let bself = bcache.self;

        bcache.current = node;
        bcache.self = self;

        ///强制读取一个参数
        if(fd.paramsize < inputCount){fd.paramsize = inputCount;}
        script.ExecuteFrameScript(0, fd, self);

        ///读取第一个还回参数进行传递
        ///this.m_outdata = OBJS[0];
        this.m_outVersion += 1;

        if(inputCount > 0) {
            for(let i = 0;i < inputCount; i ++) {
                OBJS[i] = ArgStacks[i];
            }
        }
        bcache.current = bcurr;
        bcache.self = bself;
    }

    public PushResponse()
    {
        let dirty:boolean = false;
        let len = this.m_requestVersions.length;

        for(let i = 0;i < len; i++)
        {
            let old = this.m_inputVersions[i];
            let req = this.m_requestVersions[i];
            if(old != req) {dirty = true;}
            this.m_inputVersions[i] = req;
        }

        this.m_requestVersions = null;

        if(dirty)
        {
            if(this.m_outData == null)
            {
                this.m_outData = this.m_inputDatas[0];
            }
            else
            {
                let inputdata0 = this.m_inputDatas[0];
                if(inputdata0 && inputdata0.CopyTo)
                {
                    inputdata0.CopyTo(this.m_outData);
                }
                this.m_inputDatas[0] = this.m_outData;
            }

            if(this.m_usingExecute )
            {
                this.Execute0(this.m_inputDatas);
            }
        }

        let pushlist = this.m_waitResponse.concat();
        this.m_waitResponse.length = 0;

        for(let req of pushlist)
        {
            req.Push(this.m_outData, this.m_outVersion);
        }
    }

    public OnResponse(data:any, version:number, inIndex:number, reqIndex:number):void
    {
        this.m_requestVersions[inIndex] = version;
        this.m_inputDatas[inIndex] = data;
        this.m_requestCount -= 1;

        if(this.m_requestCount <= 0)
        {
            this.PushResponse();
        }
    }

    public RequestInputs()
    {
        if(this.m_requestVersions == null)
        {
            this.m_requestCount = 0;

            let graph:IKFGraphContext = this.m_node.m_ctx;
            let nodedata = this.m_node.data;

            let inputs = nodedata.inputs;
            let totalsize = inputs.length;

            let requestDatas:any[] = [];

            for (let i = 0; i < totalsize; i ++)
            {
                let input = inputs[i];

                let nodeName:KFDName = input.name;
                let nodeOutIndex:number = input.dest;
                let inputNode:KFGraphBlockBase = null;
                let target:KFBlockTarget = this.m_t;

                if(nodeName.value == GRAPH_NAME_INPUT.value) {
                    ///外部输入
                    let parent:KFActor = target.parent as KFActor;
                    if(parent) {
                        ///找到节点
                        let parentNode = parent.graph.GetBlock(target.ownerNode);
                        if(parentNode){
                            let pnodeInputs = parentNode.data.inputs;
                            let nodeinput = pnodeInputs ? pnodeInputs[nodeOutIndex] : null;
                            if(nodeinput) {
                                nodeOutIndex = nodeinput.dest;
                                nodeName = nodeinput.name;
                                inputNode  = parent.graph.GetBlock(nodeName);
                                target = parent;
                            }
                        }
                    }
                }
                else
                {
                    inputNode = graph.GetBlock(nodeName);
                }

                if(inputNode)
                {
                    this.m_requestCount += 1;
                    let request:PullRequest = new PullRequest();

                    request.requsetIndex = nodeOutIndex;
                    request.inIndex = i;

                    requestDatas.push({node:inputNode,target:target,request:request});

                    //inputNode.Pull(this.m_t, request);
                }
            }

            if(requestDatas.length > 0) {
                this.m_requestVersions = [];
                let returnCall = this.OnResponse.bind(this);
                for ( let req of requestDatas){
                    let request = req.request;
                    request.returnCall = returnCall;
                    req.node.Pull(req.target, request);
                }
            }else{
                ///没有输入直接还回
                this.m_requestVersions = [0];
                this.PushResponse();
            }
        }
    }

    public AddRequest(request:PullRequest):void
    {
        this.m_waitResponse.push(request);
        this.RequestInputs();
    }
}

export class KFPullNode extends KFGraphBlockBase
{
    private InitCreateName(target:KFBlockTarget)
    {
        target.name = new KFDName(this.data.name.toString() + "@" + target.sid);
    }

    public Create(ctx: IKFGraphContext, data: any)
    {
        super.Create(ctx, data);
    }

    public Activate(self:KFBlockTarget):any
    {
        let m_target:KFBlockTarget = null;
        let targetdata = this.data.target;
        let selfActor:KFActor = self as KFActor;

        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            ///没有命名的实例可以随意创建
            let instname: KFDName = this.data.instname;
            let instval = instname ? instname.value : 0;
            if (instval > 0)
            {
                m_target = selfActor.FindChild(instval);
            }

            if(m_target == null)
            {
                m_target = selfActor.CreateChild(targetdata,null, instval > 0 ? null : this.InitCreateName.bind(this));
                m_target.ownerNode = this.data.name;
            }
        }
        else
        {
            m_target = this.GetAttachTarget(selfActor);
        }

        return m_target;
    }

    public Deactive(self:KFBlockTarget, force: boolean = false)
    {
        let targetdata = this.data.target;

        if (targetdata && targetdata.option == KFBlockTargetOption.Create)
        {
            let container:KFActor = self as KFActor;
            let instname: KFDName = this.data.instname;

            if (instname == null || instname.value == 0) {
                container.DeleteChildrenBySuffix(this.data.name.toString() + "@");
            }
            else {
                let m_target = this.GetAttachTarget(container);
                if (m_target) {
                    container.DeleteChild(m_target);
                }
            }
        }
    }

    public Pull(currentTarget: KFBlockTarget, request: PullRequest)
    {
        let tdata = this.data ? this.data.target : null;
        if(tdata)
        {
            let currentActor:KFActor = currentTarget as KFActor;
            if(tdata.option == KFBlockTargetOption.Ignore)
            {
                let nodename:KFDName = this.data.name;
                let executor:PullNodeExecutor = <any>currentActor.FindScript(nodename);
                if(executor == null)
                {
                    executor = new PullNodeExecutor(this, currentActor);
                    currentActor.AddScript(nodename, executor);
                }
                executor.AddRequest(request);
                return;
            }
            else
            {
                ///请求目标的结果
                let target:KFActor = this.Activate(currentTarget);
                if(target){
                    let outNodeName = GRAPH_STRING_OUTPUT + request.requsetIndex;
                    let outNode:KFGraphBlockBase = target.graph.GetBlockStr(outNodeName);
                    if(outNode){
                        outNode.Pull(target, request);
                        return;
                    }
                }
            }
        }

        super.Pull(currentTarget,request);
    }
}