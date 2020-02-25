import {URLRequest} from "./URLRequest";
import {URLRequestMethod} from "./URLRequestMethod";
import {URLLoaderDataFormat} from "./URLLoaderDataFormat";
import {URLVariables} from "./URLVariables";
import {HttpRequest_Type} from "./Request/HttpRequest";
import {HttpMethod} from "./Request/HttpMethod";
import {URLRequestHeader} from "./URLRequestHeader";
import {TypeEvent} from "../../Core/Misc/TypeEvent";
import {HttpResponseType} from "./Request/HttpResponseType";

    function $getUrl(request: URLRequest): string
    {
        let url: string = request.url;
        //get请求没有设置参数，而是设置URLVariables的情况
        if (url.indexOf("?") == -1 && request.method == URLRequestMethod.GET && request.data && request.data instanceof URLVariables) {
            url = url + "?" + request.data.toString();
        }
        return url;
    }

    export class URLLoader
    {
        public IO_ERROR_Event:TypeEvent<any> = new TypeEvent<any>();
        public COMPLETE_Event:TypeEvent<any> = new TypeEvent<any>();

        public constructor(request: URLRequest = null)
        {
            if (request) {
                this.load(request);
            }
        }

        public dataFormat: string = URLLoaderDataFormat.TEXT;
        public data: any = null;

        public _request: URLRequest = null;

        public geturl():string {
            return this._request ? this._request.url : "";
        }
        
        public load(request: URLRequest): void
        {
            this._request = request;
            this.data = null;
            let loader = this;

            if (loader.dataFormat == URLLoaderDataFormat.TEXTURE)
            {
                ///TODO
                return;
            }
            if (loader.dataFormat == URLLoaderDataFormat.SOUND)
            {
                ///TODO
                return;
            }

            let virtualUrl: string = $getUrl(request);
            let httpRequest = HttpRequest_Type.new_instance();
            httpRequest.open(virtualUrl, request.method == URLRequestMethod.POST ? HttpMethod.POST : HttpMethod.GET);
            let sendData;
            if (request.method == URLRequestMethod.GET || !request.data) {
            }
            else if (request.data instanceof URLVariables)
            {
                httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                let urlVars: URLVariables = <URLVariables>request.data;
                sendData = urlVars.toString();
            }
            else {
                httpRequest.setRequestHeader("Content-Type", "multipart/form-data");
                sendData = request.data;
            }
            let length = request.requestHeaders.length;
            for (let i: number = 0; i < length; i++)
            {
                let urlRequestHeader: URLRequestHeader = request.requestHeaders[i];
                httpRequest.setRequestHeader(urlRequestHeader.name, urlRequestHeader.value);
            }
            httpRequest.COMPLETE_Event.on((res:any)=> {
                loader.data = httpRequest.response;
                loader.COMPLETE_Event.emit(loader);
            });
            httpRequest.IO_ERROR_Event.on((res:any)=>{
                loader.IO_ERROR_Event.emit(loader);
            });
            httpRequest.responseType = loader.dataFormat == URLLoaderDataFormat.BINARY ? HttpResponseType.ARRAY_BUFFER : HttpResponseType.TEXT;
            httpRequest.send(sendData);
        }

        private getResponseType(dataFormat: string): string
        {
            switch (dataFormat)
            {
                case URLLoaderDataFormat.TEXT:
                case URLLoaderDataFormat.VARIABLES:
                    return URLLoaderDataFormat.TEXT;
                case URLLoaderDataFormat.BINARY:
                    return "arraybuffer";

                default:
                    return dataFormat;
            }
        }

        public _status: number = -1;
        public __recycle(): void
        {
            this._request = null;
            this.data = null;
        }
    }