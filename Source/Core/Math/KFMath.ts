export class KFMath
{
    public static float32(f3:any):number
    {
        return Math.round(f3.rawValue / 1024.0000 * 1000) / 1000.0;
    }

    public static setfloat32(f3:any, val:number)
    {
        f3.rawValue = Math.round(val * 1024);
    }

    public static v3Val(name,v3:any):number
    {
        if(v3)
            return KFMath.float32(v3[name]);
        return 0;
    }

    public static v3Set(name,v3:any,val:number)
    {
        if(v3)
        {
            KFMath.setfloat32(v3[name],val);
        }
    }

    public static v3Setxyz(v3:any,x:number,y:number,z:number = 0)
    {
        if(v3)
        {
            v3.x.rawValue = x * 1024;
            v3.y.rawValue = y * 1024;
            v3.z.rawValue = z * 1024;
        }
    }

    public static v3New(x:number = 0,y:number = 0,z:number = 0):any
    {
       let  v3 = {__cls__:"Vector3",
            x:{__cls__:"float32",rawValue:Math.round(x * 1024)}
            ,   y:{__cls__:"float32",rawValue:Math.round(y * 1024)}
            ,   z:{__cls__:"float32",rawValue:Math.round(z * 1024)}

           , setxyz:function (x:number,y:number,z:number) {
               this.x.rawValue = x * 1024;
               this.y.rawValue = y * 1024;
               this.z.rawValue = z * 1024;
           }
       };

       return v3;
    }
}