import {IKFRuntime} from "../ACTS/Context/IKFRuntime";
import {IKFConfigs, IKFConfigs_Type} from "../ACTS/Context/IKFConfigs";
import {IKFDomain} from "../ACTS/Context/IKFDomain";
import {KFEventTable} from "../Core/Misc/KFEventTable";
import {KFRandom} from "../ACTS/Context/KFRandom";
import {KFScriptSystem} from "../ACTS/Script/KFScriptSystem";
import {KFTimers} from "../ACTS/Context/KFTimers";
import {KFGlobalDefines} from "../ACTS/KFACTSDefines";
import {TypeEvent} from "../Core/Misc/TypeEvent";
import {KFDomain} from "../ACTS/Context/KFDomain";
import {KFActor} from "../ACTS/Actor/KFActor";
import {KFDName} from "../KFData/Format/KFDName";

export class KFiSayPlayer implements IKFRuntime
{
    public configs: IKFConfigs;
    public domain: IKFDomain;
    public etable: KFEventTable;
    public frameindex: number;
    public frametime: number;
    public frametimes: number;
    public parent: IKFRuntime;
    public random: KFRandom;
    public realytime: number;
    public realytimes: number;

    public root(): IKFRuntime
    {
        if(this.parent == null)
            return this;
        return this.parent.root();
    }

    public scripts: KFScriptSystem;
    public timers: KFTimers;

    private m_basedir:string;
    private m_path:string;
    private m_realytimestart:number;
    private m_tpf:number = KFGlobalDefines.TPF;
    private m_userdata:any;
    private m_root:KFActor;


    public onEnterFrame:TypeEvent<number> = new TypeEvent<number>();
    public onEndFrame:TypeEvent<number> = new TypeEvent<number>();

    public constructor(userdata:any = null)
    {
        this.m_userdata = userdata;
    }

    public Init(basedir:string)
    {
        //LOG_WARNING("%s", basedir.c_str());
        this.m_basedir = basedir;

        this.m_realytimestart = (new Date()).getTime();
        this.frametime = 0;
        this.frameindex = 0;
        this.realytime = 0;
        this.m_tpf = KFGlobalDefines.TPF;

        this.configs = IKFConfigs_Type.new_default();
        this.configs.Init(basedir);
        this.domain = new KFDomain(this);
        ///后面有需要再实现
        this.timers = new KFTimers(this);
        this.etable = new KFEventTable();
        this.random = new KFRandom();
        this.random.Init(0);

        this.scripts = new KFScriptSystem(this);
        this.scripts.Init();
    }

    public Play(path:string)
    {
        //LOG_WARNING("%s", path.c_str());
        this.m_path = path;

        let metaData = this.configs.GetMetaData(path,false);
        let KFBlockTargetData = {
                asseturl:path
            ,   instname:new KFDName("_root")
        };
        //kfDel(m_root);
        this.m_root = <KFActor>this.domain.CreateBlockTarget(KFBlockTargetData);
        this.m_root.Construct(metaData, this);
        this.m_root.ActivateBLK(KFBlockTargetData);
    }

    public Tick()
    {
        let currenti  = this.frameindex + 1;
        this.frameindex = currenti;
        let ticks = (new Date()).getTime();

        this.realytime = ticks;
        this.realytimes = ticks;

        this.realytimes /= 1000;
        this.frametime = currenti * this.m_tpf;
        this.frametimes = this.frametime;
        this.frametimes /= 1000;

        this.onEnterFrame.emit(currenti);
        if(this.m_root)
            this.m_root.Tick(currenti);
        this.onEndFrame.emit(currenti);
    }

}