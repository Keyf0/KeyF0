import {TypeEvent} from "../Core/Misc/TypeEvent";


export class InputState
{
    public vkey:number = 0;
    public arg:any = null;
}

export class KFGameInputs
{
    private m_lastRepeatableKey:number = 0;
    private m_currstate:InputState = new InputState();

    public onInput:TypeEvent<InputState> =
        new TypeEvent<InputState>();

    public Init():void
    {

    }

    public Shutdown():void
    {
        this.onInput.clear();
    }

    public PressKey(vkey:number, arg:any = null)
    {
        let state:InputState = this.m_currstate;
        state.vkey = vkey;
        state.arg = arg;

        if(this.IsRepeatableKey(vkey))
        {
            this.m_lastRepeatableKey = vkey;
        }

        this.onInput.emit(state);
    }

    public ReleaseKey(vkey:number)
    {
        let state:InputState = this.m_currstate;

        state.vkey = this.VKEY_PRESS_TO_STOP(vkey);
        state.arg = null;

        this.onInput.emit(state);
    }

    public ClearCache()
    {

    }

    public Tick()
    {
        if(this.m_lastRepeatableKey != 0)
        {
            let state:InputState = this.m_currstate;
            state.vkey = this.m_lastRepeatableKey;
            state.arg = null;
            this.onInput.emit(state);
        }
    }

    protected VKEY_PRESS_TO_STOP(vkey:number):number
    {
        return 0;
    }

    protected IsRepeatableKey(vkey:number):boolean
    {
        return false;
    }
}