import {IKFMeta} from "../../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../../ACTS/Context/KFBlockTarget";
import {EditPIXIObject} from "./EditPIXIObject";
import {PIXIShapes, PIXIShapesData} from "../PIXIShapes";
import {IKFRuntime} from "../../../ACTS/Context/IKFRuntime";

///KFD(C,CLASS=EditPIXIShapes,EXTEND=EditPIXIObject)
///KFD(*)

export class EditPIXIShapes extends EditPIXIObject
{
    public static Meta:IKFMeta = new IKFMeta("EditPIXIShapes"
        ,():KFBlockTarget=>{
            return new EditPIXIShapes();
        }
    );

    public UpdateShapesTexture(shapes:PIXIShapes, clsdata:PIXIShapesData)
    {
        let texture:PIXI.Texture = clsdata._baseTexture;

        shapes.target.texture = texture;

        this.width = texture.width;
        this.height = texture.height;

        this._target.renderer.resize(this.width, this.height);

        let self = this;
        let view:any = self.target;

        view.style.width = self.width * self._scale + "px";
        view.style.height = self.height * self._scale + "px";

        //this._target.resize();
    }


    public ActivateBLK(KFBlockTargetData: any): void
    {
        super.ActivateBLK(KFBlockTargetData);

        if(this.editTarget) {
            let shapes:PIXIShapes = this.editTarget as PIXIShapes;
            let classData:PIXIShapesData = this.editTarget.metadata.classData;
            if(classData._textures){
                this.UpdateShapesTexture(shapes, classData);
            }
            else {
                classData.Load(this.UpdateShapesTexture.bind(this, shapes));
            }
        }

        this.OnPreviewReady();
    }
}