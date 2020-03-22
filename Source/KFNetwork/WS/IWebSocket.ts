import {AMeta, DefaultType} from "../../Core/Meta/KFMetaManager";

export interface IWebSocket
{
    binaryType:string;
    onopen:(event:any) => any;
    onerror:(event:any) => any;
    onclose:(event:any) => any;
    onmessage:(event:any) => any;
    close(code?:number,msg?:string);
    send(data:any);
}

export let IWebSocket_Type:DefaultType<IWebSocket> = new DefaultType<IWebSocket>();
//设置默认就用WEB对象的
IWebSocket_Type.meta = new AMeta("WebSocket",function (url?:string) {
    return new WebSocket(url);
});