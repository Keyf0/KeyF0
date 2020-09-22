import {KFiSayPlayer} from "./KFiSayPlayer";
import {KFGameInputs} from "./KFGameInputs";
import {KFGameTicker} from "./KFGameTicker";
import {BlkExecSide} from "../ACTS/Context/KFBlockTarget";

export class KFApp
{
    public userdata:any;
    public player:KFiSayPlayer;
    public gameInput:KFGameInputs;
    public gameTicker:KFGameTicker;

    public execSide:number = BlkExecSide.BOTH;

    public constructor()
    {
        this.gameInput = new KFGameInputs();
        this.gameTicker = new KFGameTicker();
    }

    public Create(userdata:any = null)
    {
        this.userdata = userdata;
        this.gameInput.Init();
        this.gameTicker.Init();
        this.gameTicker.onTick.on((dt:number)=>{
            if(this.player != null)
                this.player.Tick(dt);
        });
    }

    public Destroy()
    {
        this.gameInput.Shutdown();
        this.gameTicker.Shutdown();
        this.userdata = null;
        this.player = null;
    }

    public Play(basedir:string, path:string, editmode:boolean = false)
    {
        this.player = new KFiSayPlayer(this.userdata, editmode);
        this.player.execSide = this.execSide;
        this.player.Init(basedir);
        this.player.Play(path);
    }
}
