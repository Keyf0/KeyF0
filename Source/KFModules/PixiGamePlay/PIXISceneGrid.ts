import {BlkExecSide, KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {LOG_ERROR} from "../../Core/Log/KFLog";
import {PIXIObject} from "./PIXIInterface";
import {KFDName} from "../../KFData/Format/KFDName";
import {PIXICamera} from "./PIXICamera";
import {KFActor} from "../../ACTS/Actor/KFActor";
import {PIXIShapesData} from "./PIXIShapes";

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


///KFD(C,CLASS=GridDataMap)
///KFD(P=1,NAME=sceneWidth,CNAME=场景宽,TYPE=int32)
///KFD(P=2,NAME=sceneHeight,CNAME=场景高,TYPE=int32)
///KFD(P=3,NAME=gridWidth,CNAME=格子宽,TYPE=num1)
///KFD(P=4,NAME=gridHeight,CNAME=格子高,TYPE=num1)
///KFD(P=5,NAME=layerdata0,CNAME=层数据0,TYPE=arr,OTYPE=GridData)
///KFD(P=6,NAME=layerdata1,CNAME=层数据1,TYPE=arr,OTYPE=GridData)
///KFD(P=7,NAME=layerdata2,CNAME=层数据2,TYPE=arr,OTYPE=GridData)
///KFD(*)

export class GridDataMap
{
    public static Meta:IKFMeta = new IKFMeta("GridDataMap"
        ,():GridDataMap=>{
            return new GridDataMap();
        }
        , BlkExecSide.CLIENT
    );

    public sceneWidth:number = 1;
    public sceneHeight:number = 1;
    public gridWidth:number = 100;
    public gridHeight:number = 100;

    public layerdata0:GridData[] = [];
    public layerdata1:GridData[] = [];
    public layerdata2:GridData[] = [];
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
///KFD(P=1,NAME=mapdata,CNAME=场景数据,TYPE=object,OTYPE=GridDataMap)
///KFD(*)

export class PIXISceneGrid extends KFActor implements PIXIObject
{
    public static Meta:IKFMeta = new IKFMeta("PIXISceneGrid"
        ,():KFBlockTarget=>{
            return new PIXISceneGrid();
        }
        , BlkExecSide.CLIENT
    );

    public mapdata:GridDataMap;
    public target:PIXI.Container;
    public app:PIXI.Application;

    private _layer:PIXI.Mesh;
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

        let pixiParent = <any>this.parent;
        let container = (<PIXIObject>pixiParent).getPIXITarget();
        this.app = (<PIXIObject>pixiParent).getPIXIApp();

        if (container)
        {
            container.addChild(this.target);
        }
        else
        {
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

        if(this.mapdata == null) {
            this.mapdata = new GridDataMap();
        }

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
            let mapdata = this.mapdata;
            let screenw = mapdata.sceneWidth * mapdata.gridWidth;
            let screenh = mapdata.sceneHeight * mapdata.gridHeight;

           if(pixiParent.setEditViewSize
               && false == isNaN(screenw)
               && false == isNaN(screenh))
           {
               pixiParent.setEditViewSize(screenw, screenh);
           }

           this.InitEditorLayer();
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

    public EditTick(frameindex: number): void
    {
        if(this._RequestRender)
        {
            this.RenderInternal();
            this._RequestRender = false;
        }
    }

    protected InitEditorLayer()
    {
        let mapdata = this.mapdata;
        let posxy = [];

        for(let i = 0;i < mapdata.gridWidth; i++) {
            for(let j = 0; j < mapdata.gridHeight; j++){
                let x = i * mapdata.gridWidth;
                let y = j * mapdata.gridHeight;
                posxy.push(x, y);
            }
        }

        const geometry = new PIXI.Geometry()
            .addAttribute('aVertexPosition', // the attribute name
                posxy,
                2) // the size of the attribute

            .addAttribute('aColor', // the attribute name
                [1, 0, 0, // r, g, b
                    0, 1, 0, // r, g, b
                    0, 0, 1], // r, g, b
                3); // the size of the attribute


        const shader = PIXI.Shader.from(`

                precision mediump float;
                attribute vec2 aVertexPosition;
                attribute vec3 aColor;
            
                uniform mat3 translationMatrix;
                uniform mat3 projectionMatrix;
            
                varying vec3 vColor;
            
                void main() {
            
                    vColor = aColor;
                    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            
                }`,

                        `precision mediump float;
            
                varying vec3 vColor;
            
                void main() {
                    gl_FragColor = vec4(vColor, 1.0);
                }
            
            `);

        this._layer = new PIXI.Mesh(geometry, shader);
        this.target.addChild(this._layer);
    }

    protected RenderInternal():void
    {

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

    public getPIXIApp(): PIXI.Application
    {
        return this.app;
    }

    public getPIXITarget(): PIXI.Container
    {
        return this.target;
    }
}