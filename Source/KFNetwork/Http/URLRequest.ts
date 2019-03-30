import {URLRequestMethod} from "./URLRequestMethod";
import {URLRequestHeader} from "./URLRequestHeader";

export class URLRequest
{
        public constructor(url:string = null) {

            this.url = url;
        }

        public data:any = null;
        public method:string = URLRequestMethod.GET;
        public url:string = "";

        public requestHeaders:Array<URLRequestHeader> = [];
}
