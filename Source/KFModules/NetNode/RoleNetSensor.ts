import {NetSensor} from "./NetSensor";
import {IKFRuntime} from "../../ACTS/Context/IKFRuntime";
import {NetProxy} from "./NetSensorManager";
import {IKFMeta} from "../../Core/Meta/KFMetaManager";
import {KFBlockTarget} from "../../ACTS/Context/KFBlockTarget";

export class RoleNetSensor extends NetSensor {

    public static Meta:IKFMeta = new IKFMeta("RoleNetSensor"

        ,():KFBlockTarget=>{
            return new RoleNetSensor();
        }
    );

    public Construct(metadata: any, runtime: IKFRuntime) {
        super.Construct(metadata, runtime);
        this.isRole = true;
    }

    //连接到一个RPOXY上
    public Connect(proxy:NetProxy){

    }

    public Disconnect(){

    }
}