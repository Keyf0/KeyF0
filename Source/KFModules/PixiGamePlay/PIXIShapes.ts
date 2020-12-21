import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG_ERROR, LOG_WARNING} from "../../Core/Log/KFLog";
import {PIXIObject} from "./PIXIInterface";
import {kfVector3} from "../../ACTS/Script/Global/GlobalScripts";
import {EmbedFileData} from "../../ACTS/Data/KFInternalDataTypes";


///KFD(C,CLASS=PIXIShapesData,EXTEND=KFClassData)
///KFD(P=1,NAME=ssurl,CNAME=资源路径,TYPE=kfstr)
///KFD(P=2,NAME=spriteJson,CNAME=配置文件,TYPE=object,OTYPE=EmbedFileData)
///KFD(P=3,NAME=spriteImg,CNAME=图片文件,TYPE=object,OTYPE=EmbedFileData)
///KFD(P=4,NAME=ssize,CNAME=分割尺寸,TYPE=object,OTYPE=kfVector3)
///KFD(*)

export class PIXIShapesData
{
    public static Meta:IKFMeta = new IKFMeta("PIXIShapesData"
        ,():PIXIShapesData=>{
            return new PIXIShapesData();
        }
        , BlkExecSide.CLIENT
    );

    public ssurl:string;
    public ssize:any;
    public spriteJson:EmbedFileData;
    public spriteImg:EmbedFileData;

    public _baseTexture:PIXI.Texture;
    public _textures:any[];

    private _waiting_list:((clsdata:PIXIShapesData)=>void)[] = [];

    public constructor() {}

    private OnResLoaded(loader, resources)
    {

        let res = resources[this.ssurl];
        let issheet:boolean = res.extension == "json";

        let resdata = res.data;
        this._textures = resdata.textures;

        if(!this._textures)
        {
            this._textures = [];
            let cacheId = this.ssurl + ".base";

            if(issheet)
            {
                let spritesheet = res.spritesheet;
                let indexs: string[] = resdata.indexs;

                let shtextures = spritesheet.textures;
                let baseTexture = spritesheet.baseTexture;

                // baseTexture.cacheId = this.ssurl;

                let texture = new PIXI.Texture(baseTexture);

                texture.baseTexture.cacheId = cacheId;

                PIXI.BaseTexture.addToCache(texture.baseTexture, cacheId);
                PIXI.Texture.addToCache(texture, cacheId);

                this._baseTexture = texture;

                for (let txname of indexs) {
                    this._textures.push(shtextures[txname]);
                }
            }else{


                let texture = res.texture;
                let baseTexture = texture.baseTexture;


                texture.baseTexture.cacheId = cacheId;

                PIXI.BaseTexture.addToCache(texture.baseTexture, cacheId);
                PIXI.Texture.addToCache(texture, cacheId);

                if(!this.ssize || this.ssize.x == 0 || this.ssize.y == 0) {
                    this._textures.push(texture);
                }
                else{

                    let framew = this.ssize.x;
                    let frameh = this.ssize.y;

                    let inum = texture.width / framew;
                    let jnum = texture.height / frameh;

                    for(let i = 0; i < inum; i ++)
                    {
                        for(let j = 0; j < jnum; j ++)
                        {
                            let rect = new PIXI.Rectangle (i * framew , j * frameh, framew, frameh);
                            let txtFrame = new PIXI.Texture(baseTexture, rect);

                            PIXI.Texture.addToCache(txtFrame, cacheId + "_" + i + "_" + j);
                            this._textures.push(txtFrame);
                        }
                    }

                    //let texture = new PIXI.Texture(baseTexture);
                }
            }

            resdata.textures = this._textures;
            //console.log(resources, this._textures, this._waiting_list);
        }

        for(let callback of this._waiting_list)
        {
            callback(this);
        }
        this._waiting_list.length = 0;
    }

    public Ready(metapath:string, basedir:string)
    {
        if(this.ssurl && this.ssurl != "")
        {
            let loader = PIXI.Loader.shared;

            loader.baseUrl = basedir;
            loader.add(this.ssurl);
            /// ADD CACHE
            loader.load(this.OnResLoaded.bind(this));
        }
    }

    public Load(func:(clsdata:PIXIShapesData)=>void)
    {
        if(this._textures)
        {
            func(this);
        }else
        {
            this._waiting_list.push(func);
        }
    }
}

///KFD(C,CLASS=PIXIShapes,EXTEND=KFBlockTarget,EDITCLASS=EditPIXIShapes)
///KFD(*)

export class PIXIShapes extends KFBlockTarget
{
    public static Meta:IKFMeta = new IKFMeta("PIXIShapes"
        ,():KFBlockTarget=>{
            return new PIXIShapes();
        }
        , BlkExecSide.CLIENT
    );

    public target:PIXI.Sprite;

    protected _display:number;
    protected _textures:any[];

    private _manul_dir:any;

    private onResUpdate(classData:PIXIShapesData)
    {
        this._textures = classData._textures;
        /// update
        if(this._display != undefined)
        {
            let currdisplay: number = this._display;
            this._display = -1;
            this.set_display(currdisplay);
        }
    }

    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        if(this.target != null)
        {
            LOG_ERROR("重复ActivateBLK");
            return;
        }

        let shapedata:PIXIShapesData = this.metadata.classData;
        if(shapedata == null)
        {
            LOG_ERROR("找不到资源文件");
            return;
        }

        shapedata.Load(this.onResUpdate.bind(this));


        this.target = new PIXI.Sprite();
        let pixiParent = <any>this.parent;
        let container = (<PIXIObject>pixiParent).getPIXITarget();

        if (container) {
            container.addChild(this.target);
        } else {
            LOG_ERROR("{0}对象不能加入父级{1}"
                , this.name.toString()
                , pixiParent.name.toString());
        }
    }

    public DeactiveBLK(): void
    {
        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();
        if (container) {
            container.removeChild(this.target);
            this.target.destroy();
            this.target = null;
        }

        super.DeactiveBLK();
    }


    public get position(){
        return new kfVector3(this.target.x,this.target.y);
    }

    public set_position(v3?: { x: number; y: number; z?: number }): void {
        if(!v3)v3 = this.position;
        this.target.setTransform(v3.x,v3.y);
    }

    public set_rotation(v3?: { x?: number; y?: number; z: number }): void {
        if(!v3)v3 = this.rotation;
        this.target.rotation = v3.z;
    }

    public set_scale(v3?: { x: number; y: number; z?: number }) {
        let scale = this.target.scale;
        scale.x = v3.x;
        scale.y = v3.y;
    }

    public get visible() {return this.target.visible;}
    public set visible(v:boolean) {this.target.visible = v;}

    public get display():number {return this._display;}
    public set_display(v:number,bJumpFrame:boolean = false) {
        if(this._display != v){
            this._display = v;
            if(this._textures) {
                this.target.texture = this._textures[v];
            }
        }
    }

    public manual_dir(len:number){
        let pos = this.target.position;
        if(!this._manul_dir) {
            this._manul_dir = {};
            this._manul_dir.len = len;
            let pvt = this.target.anchor;

            let halfw = this.target.width / 2;
            let halfh = this.target.height / 2;

            pos.x +=  halfw;
            pos.y +=  halfh;
            this._manul_dir.x = pos.x;
            this._manul_dir.y = pos.y;

            pvt.x = 0.5;
            pvt.y = 0.5;

            pos.x = this._manul_dir.x + len;
            pos.y = this._manul_dir.y;
        }
    }

    public set_dir(dir:any) {
        let manuldir = this._manul_dir;
        if(dir) {
            if(manuldir) {
                if(dir.y == 0 && dir.x == 0)return;
                let ret = Math.atan2(dir.y, dir.x);
                if (!isNaN(ret)) {
                    let pos = this.target.position;
                    let len = manuldir.len;
                    pos.x = manuldir.x + dir.x * len;
                    pos.y = manuldir.y + dir.y * len;
                    this.target.rotation = ret;
                }
            }else{
                LOG_WARNING("调用set_dir之前请先设置下manuldir");
            }
        }
    }

    public set_datas(datas:number[]){

        if(!datas || this._manul_dir)return;
        //P3_R1_S3_SK2
        this.target.setTransform(
                datas[0]
            , datas[1]
            , datas[4]
            , datas[5]
            , datas[3]
            , datas[7]
            , datas[8]);
    }
}