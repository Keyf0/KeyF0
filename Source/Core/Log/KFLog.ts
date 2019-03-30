
export function LOG(format:string, ...args)
{
    console.log(FormatLog(format,args));
}

export function LOG_WARNING(format:string,...args)
{
    console.warn(FormatLog(format,args));
}

export function LOG_ERROR(format:string,...args)
{
    console.error(FormatLog(format,args));
}

function FormatLog(format:string,args) :string
{
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