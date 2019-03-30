import {kfDateformat} from "../Misc/KFDate";

export function LOG(format:string, ...args)
{
    console.log(FormatLog(format,args,"[debug]"));
}

export function LOG_WARNING(format:string,...args)
{
    console.warn(FormatLog(format,args,"[warning]"));
}

export function LOG_ERROR(format:string,...args)
{
    console.error(FormatLog(format,args,"[error]"));
}

function FormatLog(format:string,args,head:string = "") :string
{
    format = head + format + kfDateformat(new Date()," [yyyy/MM/dd hh:mm:ss]");
    let len = args.length;
    if(len == 0) return format;
    /// {0} {1}
    let i = 0;
    while ( i < len)
    {
        let rstr = "\\{" + i +"\\}";
        format = format.replace(new RegExp(rstr,"g"), args[i]);
        i += 1;
    }
    return format;
}