import {
    IKFRuntime,
    onEditEndFrame,
    onEditEnterFrame,
    onEndFrame,
    onEnterFrame,
    onRenderFrame
} from "../ACTS/Context/IKFRuntime";
import {IKFConfigs, IKFConfigs_Type} from "../ACTS/Context/IKFConfigs";
import {IKFDomain} from "../ACTS/Context/IKFDomain";
import {KFEventTable} from "../Core/Misc/KFEventTable";
import {KFRandom} from "../ACTS/Context/KFRandom";
import {KFScriptSystem} from "../ACTS/Script/KFScriptSystem";
import {KFTimers} from "../ACTS/Context/KFTimers";
import {KFGlobalDefines} from "../ACTS/KFACTSDefines";
import {KFDomain} from "../ACTS/Context/KFDomain";
import {KFActor} from "../ACTS/Actor/KFActor";
import {KFDName} from "../KFData/Format/KFDName";
import {BlkExecSide} from "../ACTS/Context/KFBlockTarget";
import {KFDataTable} from "../ACTS/Context/KFDataTable";
import {KFEventDispatcher} from "../ACTS/Event/KFEventDispatcher";
import {LOG} from "../Core/Log/KFLog";

export class KFiSayPlayer implements IKFRuntime
{
    public isEditMode: boolean;
    public configs: IKFConfigs;
    public domain: IKFDomain;
    public etable: KFEventDispatcher;
    public realframeindex: number;
    public frameindex: number;
    public fixtpf:number;
    public frametime: number;
    public parent: IKFRuntime;
    public random: KFRandom;
    public realytime: number;
    public realyplaytime: number;
    public execSide: number = BlkExecSide.BOTH;

    public root: IKFRuntime;
    public scripts: KFScriptSystem;
    public timers: KFTimers;

    private m_basedir:string;
    private m_path:string;
    private m_userdata:any;
    private m_root:KFActor;

    private m_lastTicks:number = 0;
    private m_startTicks:number = 0;
    private m_frameTicks:number = 0;

    public constructor(userdata:any = null,editmode:boolean = false)
    {
        this.m_userdata = userdata;
        this.isEditMode = editmode;
    }

    public Init(basedir:string)
    {
        this.systems = {};
        //LOG_WARNING("%s", basedir.c_str());
        this.m_basedir = basedir;

        this.frametime = 0;
        this.frameindex = 0;
        this.realytime = 0;
        this.realframeindex = 0;
        this.fixtpf = KFGlobalDefines.FIX_TPF;

        this.configs = IKFConfigs_Type.new_default();
        this.domain = new KFDomain(this);
        ///后面有需要再实现
        this.timers = new KFTimers(this);
        this.etable = new KFEventDispatcher(this.domain);
        this.random = new KFRandom();
        this.random.Init(0);

        this.scripts = new KFScriptSystem(this);
        this.scripts.Init();
    }

    public Play(path:string)
    {
        //LOG_WARNING("%s", path.c_str());
        this.m_path = path;

        LOG("Play {0}", path);

        //let metaData = this.configs.GetMetaData(path,false);
        let KFBlockTargetData =
        {
                asseturl:path
            ,   instname:new KFDName("_root")
        };
        //kfDel(m_root);
        this.m_root = <KFActor>this.domain.CreateBlockTarget(KFBlockTargetData);
        this.m_root.ActivateBLK(KFBlockTargetData);

        this.m_lastTicks = (new Date()).getTime();
        this.m_startTicks = this.m_lastTicks;
        this.frameindex = 0;
        this.m_frameTicks = this.m_lastTicks;
    }

    public Tick(dt:number)
    {
        this.realframeindex += 1;
        let ticks = (new Date()).getTime();

        this.realytime = ticks;
        this.realyplaytime = ticks - this.m_startTicks;
        this.frametime = ticks - this.m_lastTicks; //单帧的时间
        this.m_lastTicks = ticks;

        let etb = this.etable;
        ///累计的帧时间
        while ((ticks - this.m_frameTicks) >= this.fixtpf)
        {
            this.m_frameTicks += this.fixtpf;

            let currenti  = this.frameindex + 1;
            this.frameindex = currenti;

            if(this.isEditMode) {
                etb.FireEvent(onEditEnterFrame);
                if (this.m_root) {
                    this.m_root.EditTick(currenti);
                }
                etb.FireEvent(onEditEndFrame);
            }else {

                etb.FireEvent(onEnterFrame);
                if (this.m_root) {
                    this.m_root.Tick(currenti);
                }
                etb.FireEvent(onEndFrame);
            }

        }
        ///渲染的帧只要可更新的频率运行
        this.etable.FireEvent(onRenderFrame);
    }

    public systems: { [p: string]: any };

    public DataRow(name: string, id: any): any
    {
        let dataTable:KFDataTable = this.systems[KFDName._Strs.GetNameID(name)];
        if(dataTable)
        {
            let varsmap:{[key:number]:any} = dataTable.varsmap;
            if(varsmap) return varsmap[id];
        }
        return null;
    }

    public GetSystem(name: string): any
    {
        return this.systems[KFDName._Strs.GetNameID(name)];
    }

    public SetSystem(name: string, sys: any)
    {
        this.systems[KFDName._Strs.GetNameID(name)] = sys;
    }
}