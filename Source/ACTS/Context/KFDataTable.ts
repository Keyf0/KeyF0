import {KFBlockTarget} from "./KFBlockTarget";
import {KFDName} from "../../KFData/Format/KFDName";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";


///KFD(C,CLASS=KFDataTable,EXTEND=KFBlockTarget)
///KFD(P=1,NAME=struct,CNAME=结构定义,TYPE=object,OTYPE=SDBLKVarsDef)
///KFD(P=2,NAME=pkey,CNAME=主键名称,TYPE=kfname)
///KFD(P=3,NAME=rows,CNAME=数据行,TYPE=arr,OTYPE=SDBLKVars,CALL=OnReadRows)

///KFD(*)

export class KFDataTable extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("KFDataTable"

        ,():KFBlockTarget=>{
            return new KFDataTable();
        }
    );

    //结构定义
    public struct:any;
    //主键名称BLKVarDef
    public pkey:KFDName;
    //数据行数
    public rows:any[];

    public varsmap:{[key:number]:any};

    public OnReadRows(rs:any[]):void
    {
        if(this.rows == null)
        {
            return;
        }

        this.varsmap = {};
        let pkeyval:number = this.pkey ? this.pkey.value : 0;

        for(let i:number = 0;i < this.rows.length; i ++)
        {
            let row:any = this.rows[i];
            let varvals:any[] = row.value;
            if(varvals != null){
                for(let j:number = 0; j < varvals.length; j ++){
                    let varval = varvals[j];
                    let nameid:number = varval.name.value;
                    row[varval.name.toString()] = varval.value;
                    if(nameid == pkeyval && pkeyval > 0){
                        this.varsmap[varval.value.getValue()] = row;
                    }
                }
            }
        }

    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);
        this.runtime.systems[this.name.value] = this;
    }

    public DeactiveBLK(): void
    {
        delete this.runtime.systems[this.name.value];
        this.varsmap = null;
        super.DeactiveBLK();
    }

}