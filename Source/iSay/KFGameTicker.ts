import {TypeEvent} from "../Core/Misc/TypeEvent";

export class KFGameTicker
{
    public static FixedTickTime:number;
    public onTick:TypeEvent<number> = new TypeEvent<number>();
    public onFixedTick:TypeEvent<void> = new TypeEvent<void>();

    private m_dt:number;

    public Init(){}
    public Shutdown()
    {
        this.onTick.clear();
        this.onFixedTick.clear();
    }

    public TickInput(dt:number)
    {
        this.onTick.emit(dt);
        this.m_dt += dt;

        let fixtime = KFGameTicker.FixedTickTime;

        if (fixtime > 0 && this.m_dt >= fixtime)
        {
            this.onFixedTick.emit();
            this.m_dt -= fixtime;
        }
    }
}