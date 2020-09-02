import {KFBlockTarget} from "./KFBlockTarget";


///KFD(C,CLASS=KFDataTable,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=struct,CNAME=结构定义,TYPE=object,OTYPE=SDBLKVarsDef)
///KFD(P=2,NAME=rows,CNAME=数据行,TYPE=arr,OTYPE=SDBLKVars)
///KFD(*)

export class KFDataTable extends KFBlockTarget
{
    //结构定义
    public struct:any;
    //数据行数
    public rows:any[];
}