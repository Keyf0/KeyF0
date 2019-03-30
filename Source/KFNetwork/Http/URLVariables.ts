
export class URLVariables
{
    public constructor(source:string = null)
    {
        if (source !== null)
        {
            this.decode(source);
        }
    }


    public variables:Object = null;
    public decode(source:string):void {
        if (!this.variables) {
            this.variables = {};
        }
        source = source.split("+").join(" ");
        let tokens, re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(source)) {
            let key = decodeURIComponent(tokens[1]),
                val = decodeURIComponent(tokens[2]);
            //没有重复键值，直接赋值
            if ((key in this.variables) == false) {
                this.variables[key] = val;
                continue;
            }
            //有重复键值，如果已经存在数组，直接push到数组，否则创建一个新数组
            let value = this.variables[key];
            if (value instanceof Array) {
                (<Array<string>>value).push(val)
            }
            else {
                this.variables[key] = [value, val];
            }
        }
    }

    public toString():string {
        if (!this.variables) {
            return "";
        }
        let variables:any = this.variables;
        let stringArray:string[] = [];
        for (let key in variables) {
            stringArray.push(this.encodeValue(key, variables[key]));
        }
        return stringArray.join("&");
    }


    private encodeValue(key:string, value:any) {
        if (value instanceof Array) {
            return this.encodeArray(key, value);
        }
        else {
            return encodeURIComponent(key) + "=" + encodeURIComponent(value);
        }
    }


    private encodeArray(key:string, value:string[]) {
        if (!key)
            return "";
        if (value.length == 0) {
            return encodeURIComponent(key) + "=";
        }
        return value.map(v=> encodeURIComponent(key) + "=" + encodeURIComponent(v)).join("&");
    }
}
