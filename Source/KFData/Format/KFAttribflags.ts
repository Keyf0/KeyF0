import {KFDTable} from "./KFDTable";
import {LOG} from "../../Core/Log/KFLog";
import {KFDataType} from "./KFD";

export class KFAttribflags {

    ////////////////////////////////////////////////
    ///如果数组或对象不为空后再置空可能会有问题[没有完善]
    /////////////////////////////////////////////////

    public static getpropertynet(item:any):string {
        let unknowtags = item.unknowtags;
        if(unknowtags) {
            for (let tagitem of unknowtags) {
                if (tagitem.tag == "NET")
                    return tagitem.val;
            }
        }
        return "";
    }

    ///会给对象增加__cls__属性方面读写数据
    public static buildattribflags( obj:any
        , kfddata:any
        , attribflags:KFAttribflags = null
        , creatupdate:boolean = true
        , allprops:boolean = true
        , initflags:KFAttribflags = null
        , extprops:any[] = null):KFAttribflags {

        if(creatupdate && !obj.hasOwnProperty("__cls__")){
            ///对象不包括__cls__属性需要增加
            let clsname = kfddata["class"];
            if(clsname) obj.__cls__ = clsname;
        }

        if(attribflags == null) {
            attribflags = new KFAttribflags(obj,undefined,true);
        }
        let extendcls = kfddata["extend"];
        if(extendcls) {
            let extenddata = KFDTable.kfdTB.get_kfddata(extendcls);
            if(extenddata != null) {
                KFAttribflags.buildattribflags(obj, extenddata, attribflags,false, allprops, initflags);
            }
        }

        let valarr = kfddata["propertys"];

        //手动增加一些参数
        if (extprops != null){
            extprops.unshift.apply(extprops,valarr);
        }

        for (let item of valarr) {

            let netvalue = KFAttribflags.getpropertynet(item);
            //查看定义，如果是never则一定不能参与网络同步
            if(netvalue == "never"){
                netvalue = "";
            }
            else if(allprops){
                netvalue = "life";
            }

            if(netvalue != "")
            {
                let name = item.name;

                if(allprops == false && initflags) {
                    ///增加_all_表示所有的子集
                    let initAF = new KFAttribflags();
                    initAF._all_ = true;
                    initflags[name] = initAF;
                    LOG("收集初始化数据:{0}",name);
                }

                if (netvalue == "life") {

                    let currval = obj ? obj[name] : null;

                    let flag: KFAttribflags = new KFAttribflags(currval,obj,true,name);
                    attribflags[name] = flag;
                    if (!attribflags._flags_)
                        attribflags._flags_ = [];
                    attribflags._flags_.push(flag);

                    let typeid = KFDataType.GetTypeID(item.type);
                    if (typeid <= KFDataType.OT_UINT64) {
                        ///普通属性的检测
                        flag.update = flag.update_;
                    } else if (typeid == KFDataType.OT_OBJECT) {

                        let okfd = null;
                        if(item.otype != undefined) {
                            okfd = KFDTable.kfdTB.get_kfddata(item.otype);
                        }
                        else
                            okfd = item.kfd;
                        KFAttribflags.buildattribflags(currval, okfd, flag);
                    }
                    else if (typeid == KFDataType.OT_MIXOBJECT) {
                        ///对象为空时先用一个空检测函数
                        if (currval) {
                            let mixkfd = KFDTable.kfdTB.get_kfddata(currval.__cls__);
                            KFAttribflags.buildattribflags(currval, mixkfd, flag);
                        } else {
                            flag.update = flag.null_;
                        }
                    } else if (typeid == KFDataType.OT_ARRAY) {
                        let okfd = KFDTable.kfdTB.get_kfddata(item.otype);
                        if (okfd) {
                            ///对象数组
                            flag._flags_ = [];
                            flag._kfd_ = okfd;
                            flag.update = flag.update_arrobj;

                        } else {
                            ///普通的数组
                            flag._v_ = currval ? currval.concat() : null;
                            flag.update = flag.update_arr;
                        }
                    } else if (typeid == KFDataType.OT_MIXARRAY) {
                        flag._flags_ = [];
                        flag.update = flag.update_mixarr;
                    }

                }
            }
        }

        if(creatupdate != false)
            attribflags.update = attribflags.update_self;
        return attribflags;
    }

    public _w_:boolean;
    public _v_:any;
    public _t_:any;
    public _n_:string;
    public _all_:boolean;
    public _isdirty_:boolean;
    public _flags_:KFAttribflags[];
    ///绑定的KFD
    public _kfd_:any;
    public update:()=>boolean;

    public constructor(v?:any
                       ,t?:any
                       ,w?:boolean
                       ,n?:string){
        this._v_ = v;
        this._t_ = t;
        this._w_ = w;
        this._n_ = n;
    }

    public update_():boolean {
        this._w_ = false;
        if (this._t_) {
            let curr = this._t_[this._n_];
            if (curr != this._v_) {
                this._w_ = true;
                this._v_ = curr;
            }
        }
        return this._w_;
    }

    public null_():boolean {
        this._w_ = false;
        if (this._t_) {
            let curr = this._t_[this._n_];
            if (curr != null) {
                this._w_ = true;
                this._v_ = curr;
                let mixkfd = KFDTable.kfdTB.get_kfddata(curr.__cls__);
                KFAttribflags.buildattribflags(curr, mixkfd, this);
            }
        }
        return this._w_;
    }

    public update_arr():boolean {
        this._w_ = false;
        if (this._t_) {
            let curr = this._t_[this._n_];
            if (curr) {
                if (!this._v_ || curr.length != this._v_.length) {
                    this._w_ = true;
                    this._v_ = curr.concat();
                } else {
                    ///记录比较
                    for (let i = 0; i < this._v_.length; i++) {
                        let citemv = curr[i];
                        if (this._v_[i] != citemv) {
                            this._v_[i] = citemv;
                            this._w_ = true;
                        }
                    }
                }
            } else if (this._v_) {
                this._v_ = null;
                this._w_ = true;
            }
        }
        return this._w_;
    }


    public update_arrobj ()
    {
        this._w_ = false;
        if (this._t_) {
            let curr = this._t_[this._n_];
            if (curr != this._v_) {
                this._w_ = true;
                this._v_ = curr;
                //变成了空对象了
                if (curr == null) {
                    this._flags_ = [];
                }
            }

            if (curr) {
                let vallen = curr.length;
                for (let i = 0; i < vallen; i++) {

                    let arritemval = curr[i];
                    let arritemflag = this._flags_[i];

                    if (arritemflag && arritemflag._v_ != arritemval) {
                        //对象都已经变更了
                        arritemflag = null;
                    }

                    if (!arritemflag) {
                        arritemflag = new KFAttribflags(arritemval,curr,true,i + "");
                        KFAttribflags.buildattribflags(arritemval, this._kfd_, arritemflag);
                        this._flags_[i] = arritemflag;
                        this._w_ = true;
                    } else {
                        //还是原始对象可以调用更新检测
                        this._w_ = arritemflag.update() || this._w_;
                    }
                }
            }
        }
        return this._w_;
    }

    public update_mixarr():boolean {
        this._w_ = false;
        if (this._t_) {
            let curr = this._t_[this._n_];
            if (curr != this._v_) {
                this._w_ = true;
                this._v_ = curr;
                //变成了空对象了
                if (curr == null) {
                    this._flags_ = [];
                }
            }
            if (curr) {
                let vallen = curr.length;
                for (let i = 0; i < vallen; i++) {

                    let arritemval = curr[i];
                    let arritemflag = this._flags_[i];

                    if (arritemflag && arritemflag._v_ != arritemval) {
                        //对象都已经变更了
                        arritemflag = null;
                    }

                    if (!arritemflag) {
                        arritemflag = new KFAttribflags();
                        arritemflag._w_ = true;
                        arritemflag._t_ =  curr;
                        arritemflag._v_ =  arritemval;
                        arritemflag._n_ =  i + "";
                        let arritmkfd = KFDTable.kfdTB.get_kfddata(arritemval.__cls__);
                        KFAttribflags.buildattribflags(arritemval, arritmkfd, arritemflag);
                        this._flags_[i] = arritemflag;
                        this._w_ = true;

                    } else {
                        //还是原始对象可以调用更新检测
                        this._w_ =  arritemflag.update() || this._w_ ;
                    }
                }
            }
        }
        return this._w_;
    }

    public update_self():boolean {
        this._w_ = false;
        let cval = this._v_;
        if(cval && this._flags_){
            let flaglen = this._flags_.length;
            for(let i = 0;i < flaglen;i ++) {
                let itemflag = this._flags_[i];
                if(itemflag._t_ != cval){
                    itemflag._t_ = cval;
                    this._w_ = true;
                }
                this._w_ = itemflag.update() || this._w_;
            }
        }
        return this._w_;
    }
}