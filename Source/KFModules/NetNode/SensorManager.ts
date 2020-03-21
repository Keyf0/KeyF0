import {NetSensor} from "./NetSensor";
import {RPCObject} from "./NetData";

export interface SensorManager extends RPCObject {

    AddSensor(sensor:NetSensor);
    RemoveSensor(sensor:NetSensor);
}