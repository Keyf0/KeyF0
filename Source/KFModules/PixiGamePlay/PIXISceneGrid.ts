import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG, LOG_ERROR} from "../../Core/Log/KFLog";
import {PIXIObject} from "./PIXIInterface";
import {KFDName} from "../../KFData/Format/KFDName";
import {PIXICamera} from "./PIXICamera";
import {KFActor} from "../../ACTS/Actor/KFActor";
import {PIXIShapesData} from "./PIXIShapes";
import {KFScriptContext} from "../../ACTS/Script/KFScriptDef";

///KFD(C,CLASS=GridData)
export class GridData
{
    public static Meta:IKFMeta = new IKFMeta("GridData"
        ,():GridData=>{
            return new GridData();
        }
        , BlkExecSide.CLIENT
    );
    ///KFD(P=1,NAME=x,CNAME=格子X坐标,TYPE=int32)
    public x:number;
    ///KFD(P=2,NAME=y,CNAME=格子Y坐标,TYPE=int32)
    public y:number;
    ///KFD(P=3,NAME=color,CNAME=颜色,TYPE=uint32)
    public color:number;
    ///KFD(P=4,NAME=textureID,CNAME=贴图ID,TYPE=uint32)
    public textureID:number;
    ///KFD(P=5,NAME=values,CNAME=数据集,TYPE=arr,OTYPE=num1)
    public values:number[]= [];
    ///KFD(*)
}


///KFD(C,CLASS=PIXISceneGridData,EXTEND=PIXIShapesData)
///KFD(*)

export class PIXISceneGridData extends PIXIShapesData
{
    public static Meta:IKFMeta = new IKFMeta("PIXISceneGridData"
        ,():PIXIShapesData=>{
            return new PIXISceneGridData();
        }
        , BlkExecSide.CLIENT
    );
};


///KFD(C,CLASS=PIXISceneGrid,EXTEND=KFActor,EDITCLASS=EditPIXIObject)
///KFD(P=1,NAME=sceneWidth,CNAME=场景宽,TYPE=int32)
///KFD(P=2,NAME=sceneHeight,CNAME=场景高,TYPE=int32)
///KFD(P=3,NAME=gridWidth,CNAME=格子宽,TYPE=num1)
///KFD(P=4,NAME=gridHeight,CNAME=格子高,TYPE=num1)
///KFD(P=5,NAME=layerdata0,CNAME=层数据0,TYPE=arr,OTYPE=GridData)
///KFD(P=6,NAME=layerdata1,CNAME=层数据1,TYPE=arr,OTYPE=GridData)
///KFD(P=7,NAME=layerdata2,CNAME=层数据2,TYPE=arr,OTYPE=GridData)
///KFD(*)

export class PIXISceneGrid extends KFActor
{
    public static Meta:IKFMeta = new IKFMeta("PIXISceneGrid"
        ,():KFBlockTarget=>{
            return new PIXISceneGrid();
        }
        , BlkExecSide.CLIENT
    );

    public sceneWidth:number;
    public sceneHeight:number;
    public gridWidth:number;
    public gridHeight:number;

    public layerdata0:GridData[] = [];
    public layerdata1:GridData[] = [];
    public layerdata2:GridData[] = [];

    public layer0:PIXI.Graphics;
    public layer1:PIXI.Graphics;
    public layer2:PIXI.Graphics;

    public target:PIXI.Container;

    private _camera:PIXICamera;
    private _drawinfo:{x:number,y:number,w:number,h:number};

    private _textures:any[];
    private _RequestRender:boolean = false;

    private onResUpdate(classData:PIXIShapesData)
    {
        this._textures = classData._textures;
    }

    protected TargetNew(KFBlockTargetData: any): any
    {
        if(this.target != null)
        {
            LOG_ERROR("重复ActivateBLK");
            return;
        }

        this.target = new PIXI.Container();

        this.layer0 = new PIXI.Graphics();
        this.target.addChild(this.layer0);
        this.layer1 = new PIXI.Graphics();
        this.target.addChild(this.layer1);
        this.layer2 = new PIXI.Graphics();
        this.target.addChild(this.layer2);

        let pixiParent = <any>this.parent;
        let container = (<PIXIObject>pixiParent).getPIXITarget();

        if (container) {
            container.addChild(this.target);
        } else {
            LOG_ERROR("{0}对象不能加入父级{1}"
                , this.name.toString()
                , pixiParent.name.toString());
        }

        let shapedata:PIXIShapesData = this.metadata.classData;
        if(shapedata == null)
        {
            LOG_ERROR("找不到资源文件");
            return;
        }

        shapedata.Load(this.onResUpdate.bind(this));

        if(this.layerdata0 == null) this.layerdata0 = [];
        if(this.layerdata1 == null) this.layerdata1 = [];
        if(this.layerdata2 == null) this.layerdata2 = [];

        if(!this.runtime.isEditMode)
        {
            ///编辑模式不检测相机
            let camera: PIXICamera = <PIXICamera>this.parent.FindChild(KFDName._Strs.GetNameID("camera"));
            if (camera == null)
            {
                LOG_ERROR("找不到camera的实例");
                return;
            }

            this._camera = camera;
            let pos = camera.position;
            this._drawinfo = {x: pos.x - 1, y: 0, w: camera.width, h: camera.height};
        }
        else
        {
            ///CHANGE SIZE?
            let screenw = this.sceneWidth * this.gridWidth;
            let screenh = this.sceneHeight * this.gridHeight;

           if(pixiParent.setEditViewSize
               && false == isNaN(screenw)
               && false == isNaN(screenh))
           {
               pixiParent.setEditViewSize(screenw, screenh);
           }
        }
    }

    protected TargetDelete()
    {
        this.tickable = false;
        let pixiobject = <PIXIObject><any>this.parent;
        let container = pixiobject.getPIXITarget();
        if (container)
        {
            container.removeChild(this.target);
            this.target.destroy();
            this.target = null;
        }
    }

    public DrawGrid(x:number,y:number,data:GridData,graphics:PIXI.Graphics)
    {
        //graphics.beginTextureFill(this._texture);
        graphics.beginFill(data.color);
        graphics.drawRect(
                x,
                y,
                this.gridWidth,
                this.gridHeight);
        graphics.endFill();
    }

    public EditTick(frameindex: number): void
    {
        if(this._RequestRender)
        {
            this.RenderInternal();
            this._RequestRender = false;
        }
    }

    protected RenderInternal():void
    {
        this.layer0.clear();
        this.layer1.clear();
        this.layer2.clear();

        for(let j = 0; j < this.sceneHeight; j ++) {

            for (let i = 0; i < this.sceneWidth; i++) {
                let index = i + this.gridHeight * j;

                let x: number = i * this.gridWidth;
                let y: number = j * this.gridHeight;

                let data0 = this.layerdata0[index];
                if (data0) {
                    this.DrawGrid(x, y, data0, this.layer0);
                }
                data0 = this.layerdata1[index];
                if (data0) {
                    this.DrawGrid(x, y, data0, this.layer1);
                }
                data0 = this.layerdata2[index];
                if (data0) {
                    this.DrawGrid(x, y, data0, this.layer2);
                }

                // gr.beginTextureFill(this._texture);
                // gr.drawRect(di.x - this._drawinfo.w * 0.5
                //    , di.y - this._drawinfo.h * 0.5,
                //    this._drawinfo.w,this._drawinfo.h);
                // gr.endFill();
            }
        }

    }

    public Render(data?:any)
    {
        this._RequestRender = true;
    }

    public Tick(frameindex: number): void
    {
        let pos = this._camera.position;
        let di = this._drawinfo;

        if(di.x != pos.x || di.y != pos.y)
        {
            di.x = pos.x;
            di.y = pos.y;

           // let gr = this.target;
            //gr.clear();
           // gr.beginTextureFill(this._texture);
           // gr.drawRect(di.x - this._drawinfo.w * 0.5
            //    , di.y - this._drawinfo.h * 0.5,
            //    this._drawinfo.w,this._drawinfo.h);
           // gr.endFill();
        }
    }

    ////
    public ScriptRunOver(runover: number, func: any, scriptContext: KFScriptContext)
    {
        let totalGrid = this.sceneWidth * this.sceneHeight;
        for(let i = 0; i < totalGrid; i++)
        {
            func(this, scriptContext, i);
        }
    }
}