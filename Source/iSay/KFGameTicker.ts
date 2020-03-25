import {TypeEvent} from "../Core/Misc/TypeEvent";
import {KFGlobalDefines} from "../ACTS/KFACTSDefines";

export class KFGameTicker
{
    public onTick:TypeEvent<number> = new TypeEvent<number>();

    private m_dt:number = 16;
    private _tickid:number = -1;

    public Init() {
        ///用渲染TPF驱动游戏的TICK
        this.m_dt = KFGlobalDefines.RENDER_TPF;
    }

    public Shutdown()
    {
        this.onTick.clear();
    }

    public Start(){

        if(this._tickid == -1)
        {
            let self = this;
            this._tickid = setInterval(
                function () {
                    self.onTick.emit(self.m_dt);
                }
                , self.m_dt);
        }
    }

    public Stop() {
        if(this._tickid != -1) {
            clearInterval(this._tickid);
            this._tickid = -1;
        }
    }
}