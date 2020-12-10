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

        this.setEditViewSize(texture.width, texture.height);
    }

    public OnEidtorInit()
    {
        super.OnEidtorInit();

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
    }
}