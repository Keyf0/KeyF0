import {DefaultType} from "../../../Core/Meta/KFMetaManager";
import {TypeEvent} from "../../../Core/Misc/TypeEvent";

export interface HttpRequest
    {
        IO_ERROR_Event:TypeEvent<any>;
        COMPLETE_Event:TypeEvent<any>;
        PROGRESS_Event:TypeEvent<any>;

        response: any;
        responseType: string;
        timeout:number;
        withCredentials: boolean;

        open(url:string, method?:string): void;
        send(data?:any): void;
        abort(): void;
        getAllResponseHeaders(): string;
        setRequestHeader(header:string, value:string): void;
        getResponseHeader(header:string): string;
    }


export let HttpRequest_Type:DefaultType<HttpRequest> = new DefaultType<HttpRequest>();