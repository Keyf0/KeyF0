import {HDocument} from "./HDocument";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {KFDataTable} from "../../ACTS/Context/KFDataTable";


///KFD(C,CLASS=EditDataTable,EXTEND=HDocument,EDITFOR=KFDataTable)
///KFD(*)

export class EditDataTable extends HDocument
{
    public static Meta:IKFMeta = new IKFMeta("EditDataTable"

        ,():KFBlockTarget=>{
            return new EditDataTable();
        });

    private _dataSource:KFDataTable;

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        /// create preview child
        let startFiles:string[] = this.runtime.configs.startFiles();
        if(startFiles && startFiles.length > 0){
            let targetData:any = {};
            targetData.asseturl = startFiles[0];
            let datatable:KFBlockTarget =  this.CreateChild(targetData);

            this._dataSource = datatable as KFDataTable;
            this.DisplaySourceData();
        }
    }

    public DeactiveBLK(): void
    {
        this._dataSource = null;
        super.DeactiveBLK();
    }

    private DisplaySourceData() :void
    {
        if(this._dataSource)
        {
            let rows:any[] = this._dataSource.rows;
            let struct:any = this._dataSource.struct;
            let tablestr:string = "";

            if(struct == null)
            {
                tablestr = "<div class=\"container\">表格没有数据</div>";
            }
            else
            {

                tablestr
                    = " <div style='width: 100%;'> <table style='width: 100%;'>\n" +
                    "    <thead>\n" +
                    "      <tr>\n";

                let attribnames:string[] = [];

                let attribs = struct.value;
                for(let i = 0; i < attribs.length ; i++){

                    let attribinfo = attribs[i];
                    let label:string = attribinfo.label ? attribinfo.label : attribinfo.name;

                    tablestr = tablestr + "<th>" + label + "</th>\n" ;
                    attribnames.push(attribinfo.name);
                }

                tablestr = tablestr + "      </tr>\n" +
                    "    </thead>\n" +
                    "    <tbody>\n";


                    if(rows)
                    {
                        for(let i:number = 0; i < rows.length; i++)
                        {
                            let row:any = rows[i];
                            let rowst = "      <tr>\n";

                            for(let j:number = 0 ; j < attribnames.length; j ++) {

                                let varval:any = row[attribnames[j]];
                                if(varval == null){
                                    rowst +="<td></td>\n";
                                }
                                else{
                                    rowst +="<td>" + varval.getValue() + "</td>\n";
                                }
                            }
                            rowst += "      </tr>\n";

                            tablestr += rowst;
                        }
                    }

                tablestr = tablestr +  "</tbody>\n" +
                    "  </table></div>";

            }

            this.nativedom.body.innerHTML = tablestr;


        }
    }
}