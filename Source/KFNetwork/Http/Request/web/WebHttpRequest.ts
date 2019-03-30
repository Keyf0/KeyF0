import {HttpRequest} from "../HttpRequest";
import {TypeEvent} from "../../../../Core/Misc/TypeEvent";
import {IKFMeta} from "../../../../Core/Meta/KFMetaManager";

export class WebHttpRequest implements HttpRequest
{
        public IO_ERROR_Event:TypeEvent<any> = new TypeEvent<any>();
        public COMPLETE_Event:TypeEvent<any> = new TypeEvent<any>();
        public PROGRESS_Event:TypeEvent<any> = new TypeEvent<any>();

        public static Meta:IKFMeta = new IKFMeta(
          "WebHttpRequest" , ():HttpRequest =>
        {
            return new WebHttpRequest();
        }
        );

        public constructor()
        {

        }

        private _xhr: XMLHttpRequest;

        public timeout: number = 0;


        public get response(): any {
            if (!this._xhr) {
                return null;
            }

            if (this._xhr.response != undefined) {
                return this._xhr.response;
            }

            if (this._responseType == "text") {
                return this._xhr.responseText;
            }

            if (this._responseType == "arraybuffer" && /msie 9.0/i.test(navigator.userAgent)) {
                let w: any = window;
                return w.convertResponseBodyToText(this._xhr["responseBody"]);
            }

            if (this._responseType == "document") {
                return this._xhr.responseXML;
            }

            /*if (this._xhr.responseXML) {
                return this._xhr.responseXML;
            }
            if (this._xhr.responseText != undefined) {
                return this._xhr.responseText;
            }*/
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


        private getXHR(): any {
            if (window["XMLHttpRequest"]) {
                return new window["XMLHttpRequest"]();
            } else {
                return new ActiveXObject("MSXML2.XMLHTTP");
            }
        }


        public open(url: string, method: string = "GET"): void {
            this._url = url;
            this._method = method;
            if (this._xhr) {
                this._xhr.abort();
                this._xhr = null;
            }
            let xhr = this.getXHR();//new XMLHttpRequest();
            if (window["XMLHttpRequest"]) {
                xhr.addEventListener("load", this.onload.bind(this));
                xhr.addEventListener("error", this.onerror.bind(this));
            } else {
                xhr.onreadystatechange = this.onReadyStateChange.bind(this);
            }
            xhr.onprogress = this.updateProgress.bind(this);
            xhr.ontimeout = this.onTimeout.bind(this)
            xhr.open(this._method, this._url, true);
            this._xhr = xhr;
        }

        public send(data?: any): void {
            if (this._responseType != null) {
                this._xhr.responseType = this._responseType;
            }
            if (this._withCredentials != null) {
                this._xhr.withCredentials = this._withCredentials;
            }
            if (this.headerObj) {
                for (let key in this.headerObj) {
                    this._xhr.setRequestHeader(key, this.headerObj[key]);
                }
            }
            this._xhr.timeout = this.timeout;
            this._xhr.send(data);
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
            let result = this._xhr.getResponseHeader(header);
            return result ? result : "";
        }

        private onTimeout(): void
        {
            this.IO_ERROR_Event.emit({"url":this._url,"msg":"timeout"});
        }


        private onReadyStateChange(): void {
            let xhr = this._xhr;
            if (xhr.readyState == 4) {// 4 = "loaded"
                let ioError = (xhr.status >= 400 || xhr.status == 0);
                let url = this._url;
                let self = this;
                window.setTimeout(function (): void {
                    if (ioError) {//请求错误
                        self.IO_ERROR_Event.emit({"url":self._url,"msg":"ioerror"});
                    }
                    else {

                        self.COMPLETE_Event.emit({"url":self._url});
                    }
                }, 0)

            }
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
            let xhr = this._xhr;
            let url = this._url;
            let ioError = (xhr.status >= 400);
            window.setTimeout(function (): void
            {
                if (ioError) {//请求错误
                    self.IO_ERROR_Event.emit({url:self._url,
                    msg:"timeout"});
                }
                else {
                    self.COMPLETE_Event.emit({"url":self._url});
                }
            }, 0);
        }


        private onerror(): void
        {
            let url = this._url;
            let self = this;
            window.setTimeout(function (): void
            {
                self.IO_ERROR_Event.emit({url:self._url,
                    msg:"timeout"});
            }, 0);
        }
}

