
import {KFBytes} from "../../KFData/Format/KFBytes";

///KFD(C,CLASS=EmbedFileData)
///KFD(P=1,NAME=path,CNAME=路径,TYPE=kfstr,EDIT=NO)
///KFD(P=2,NAME=format,CNAME=格式,TYPE=kfstr,EDIT=NO)
///KFD(P=3,NAME=data,CNAME=字节数据,TYPE=kfBytes,EDIT=NO)
///KFD(*)

export class EmbedFileData
{
    public path:string = "";
    public format:string = "";
    public data:KFBytes;
}


//编辑时用的属性定义
///KFD(C,CLASS=eAttribDef)
///KFD(P=1,NAME=name,CNAME=名称,TYPE=kfname)
///KFD(P=2,NAME=value,CNAME=值,TYPE=mixobject,OTYPE=KFScriptData)
///KFD(*)

///KFD(C,CLASS=eAttribList)
///KFD(P=1,NAME=value,CNAME=值,TYPE=arr,OTYPE=eAttribDef)
///KFD(*)


