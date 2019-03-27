

export class KFPool<T>
{
    private m_pool:Array<T> = new Array<T>();
    private m_newfunc:any;

    public constructor(newfunc:any)
    {
        this.m_newfunc = newfunc;
    }

    public clear():void
    {
        this.m_pool = new Array<T>();
    }

    public Fetch():T
    {
        if(this.m_pool.length > 0)
        {
            let tmp:T = this.m_pool.pop();
            return tmp;
        }
        if(this.m_newfunc)
            return this.m_newfunc();
        return null;
    }

    public Recycle(obj:T):void
    {
        if(obj)
        {
            this.m_pool.push(obj);
        }
    }
}