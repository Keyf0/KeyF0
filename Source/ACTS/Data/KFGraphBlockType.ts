import {KFDName} from "../../KFData/Format/KFDName";


export class KFGraphBlockType
{
    public static Normal:number = 0;
    public static InputPoint:number = 1;
    public static OutputPoint:number = 2;
    public static OutputPointDomain:number = 3;
    public static OutputPointGlobal:number = 4;
    public static EventPoint:number = 5;
    public static EventPointDomain:number = 6;
    public static EventPointGlobal:number = 7;
    public static PullNode:number = 8;
}


export var GRAPH_ARG_NULL:any = {};
export var GRAPH_NAME_ACTIVATE:KFDName = new KFDName("Activate");
export var GRAPH_NAME_INPUT:KFDName = new KFDName("Input");
export var GRAPH_STRING_OUTPUT:string = "Output";
export var GRAPH_NAME_OUTPUT:KFDName = new KFDName(GRAPH_STRING_OUTPUT);
