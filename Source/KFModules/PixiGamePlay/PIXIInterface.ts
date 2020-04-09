import {KFEvent, KFEventTable} from "../../Core/Misc/KFEventTable";


export const PIXIDown_Event:KFEvent = new KFEvent("onMouseDown");
export const  PIXIUP_Event:KFEvent = new KFEvent("onMouseUp");
export const  PIXIMOVE_Event:KFEvent = new KFEvent("onMouseMove");
export const  PIXITICK_Event:KFEvent = new KFEvent("onTick");


export interface PIXIObject
{
    getPIXITarget():PIXI.Container;
    getPIXIApp():PIXI.Application;
}


export class PIXIMouseEventEmit {

    public eventMove:boolean;
    public etable:KFEventTable;

    protected _isdown:boolean;
    protected _dragdata:any;
    protected _container:PIXI.Container;

    public constructor(c:PIXI.Container,etb:KFEventTable,move:boolean) {

        this._container = c;
        this.etable = etb;
        this.eventMove = move;

        if(this._container) {
            this._container.interactive = true;
            this._container.on('mousedown', this.onMouseDown, this)
                .on('touchstart', this.onMouseDown, this);
        }
    }

    public dispose() {
        if(this._container) {
            this._container.removeListener('mousedown', this.onMouseDown, this)
                .on('touchstart', this.onMouseDown, this);
            this.onMouseUp();
        }
    }


    private onMouseDown(event) {

        if(!this._isdown) {

            this._dragdata = event.data;

            this._isdown  = true;
            this._container.on('mouseup', this.onMouseUp, this)
                .on('mouseupoutside', this.onMouseUp, this)
                .on('touchend', this.onMouseUp, this)
                .on('touchendoutside', this.onMouseUp, this);

            if (this.eventMove) {
                // events for drag move
                this._container.on('mousemove', this.onMouseMove, this)
                    .on('touchmove', this.onMouseMove, this);
            }

            let newpos = this._dragdata.getLocalPosition(this._container);
            newpos.z = 0;
            let devent = PIXIDown_Event;
            devent.arg = newpos;

            this.etable.FireEvent(devent);
        }
    }

    private onMouseMove(){
        let newpos = this._dragdata.getLocalPosition(this._container);
        newpos.z = 0;
        let devent = PIXIMOVE_Event;
        devent.arg = newpos;
        this.etable.FireEvent(devent);
    }

    private onMouseUp() {

        if( this._isdown) {

            let newpos = this._dragdata.getLocalPosition(this._container);
            newpos.z = 0;
            this._isdown = false;
            this._dragdata = null;
            this._container.removeListener('mouseup', this.onMouseUp, this)
                .removeListener('mouseupoutside', this.onMouseUp, this)
                .removeListener('touchend', this.onMouseUp, this)
                .removeListener('touchendoutside', this.onMouseUp, this);

            if (this.eventMove) {
                // events for drag move
                this._container.removeListener('mousemove', this.onMouseMove, this)
                    .removeListener('touchmove', this.onMouseMove, this);
            }

            let devent = PIXIUP_Event;
            devent.arg = newpos;
            this.etable.FireEvent(devent);
        }
    }
}