import {HttpRequest, HttpRequest_Type} from "../../KFNetwork/Http/Request/HttpRequest";
import {TypeEvent} from "../../Core/Misc/TypeEvent";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";

import {LOG} from "../../Core/Log/KFLog";
// @ts-ignore
import * as http from "http"
// @ts-ignore
import * as bf from "buffer"
import {IKFFileIO_Type} from "../../Core/FileIO/IKFFileIO";
import {NDFileIO} from "./NDFileIO";

export class NDHttpRequest implements HttpRequest {

    public IO_ERROR_Event:TypeEvent<any> = new TypeEvent<any>();
    public COMPLETE_Event:TypeEvent<any> = new TypeEvent<any>();
    public PROGRESS_Event:TypeEvent<any> = new TypeEvent<any>();

    public static Meta:IKFMeta = new IKFMeta(
        "NDHttpRequest" , ():HttpRequest =>
        {
            return new NDHttpRequest();
        }
    );

    public constructor() {

    }

    private _xhr: http.ClientRequest;
    private _responseText:string;
    private _response:bf.Buffer = null;

    public timeout: number = 0;

    public get response(): any {

        if (this._responseType == "text")
            return this._responseText;
        else if(this._response)
            return this._response.buffer;
        return null;
    }

    private _responseType: "" | "arraybuffer" | "blob" | "document" | "json" | "text";

    public get responseType(): "" | "arraybuffer" | "blob" | "document" | "json" | "text" {
        return this._responseType;
    }

    public set responseType(value: "" | "arraybuffer" | "blob" | "document" | "json" | "text") {
        this._responseType = value;
    }

    private _withCredentials: boolean;

    public get withCredentials(): boolean {
        return this._withCredentials;
    }

    public set withCredentials(value: boolean) {
        this._withCredentials = value;
    }

    private _url: string = "";
    private _method: string = "";

    public open(url: string, method: string = "GET"): void {

        this._url = url;
        this._method = method;
    }

    public send(data?: any): void {

        this._responseText = "";
        this._response  = null;

       let req = http.request(this._url,{method: this._method});
       let self = this;

       if(this.headerObj)
       {
           for (let key in this.headerObj)
           {
               req.setHeader(key, this.headerObj[key]);
           }
       }
       req.setTimeout(this.timeout);

        req.on('error', (e) => {
            self.onerror(e.message);
        });

        req.on('timeout',()=>{
            self.onTimeout();
        });

        req.on("response", (res:http.IncomingMessage) => {

            let chunks:any[] = null;
            let chunkslen = 0;

            if(self._responseType == "text") {
                res.setEncoding('utf-8');
            }else
                chunks = []

            res.on('data',function(chunk){
                if(chunks){
                    chunks.push(chunk);
                    chunkslen += chunk.length;
                }
                else
                    self._responseText += chunk;
            });
            res.on('end',function(){
                LOG("data end...");
                if(chunks) {
                    self._response = bf.Buffer.concat(chunks, chunkslen);
                }
                self.onload();
            });
        });

        // write data to request body
        if(data)
        {
            req.write(JSON.stringify(data));
        }

        req.end();

        this._xhr = req;
    }


    public abort(): void {
        if (this._xhr) {
            this._xhr.abort();
        }
    }

    public getAllResponseHeaders(): string {
        if (!this._xhr) {
            return null;
        }
        let result = this._xhr.getAllResponseHeaders();
        return result ? result : "";
    }

    private headerObj: any;

    public setRequestHeader(header: string, value: string): void {
        if (!this.headerObj) {
            this.headerObj = {};
        }
        this.headerObj[header] = value;
    }

    public getResponseHeader(header: string): string {
        if (!this._xhr) {
            return null;
        }
        let result = this._xhr.getHeader(header);
        return result ? result : "";
    }

    private onTimeout(): void
    {
        this.IO_ERROR_Event.emit({"url":this._url,"msg":"timeout"});
    }

    private updateProgress(event): void
    {
        if (event.lengthComputable)
        {
            this.PROGRESS_Event.emit(
                {url:this._url,
                    loaded:event.loaded
                    ,total:event.total}
            );
        }
    }


    private onload(): void
    {
        let self = this;
        setTimeout(function (): void
        {
            self.COMPLETE_Event.emit({"url":self._url});
        }, 0);
    }


    private onerror(msg): void
    {
        let self = this;
        setTimeout(function (): void
        {
            self.IO_ERROR_Event.emit({url:self._url,
                msg:msg});
        }, 0);
    }

}

export function SetDefaultHttpRequest()
{
    HttpRequest_Type.meta = NDHttpRequest.Meta;
}