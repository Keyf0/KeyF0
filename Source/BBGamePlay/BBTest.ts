
import * as BABYLON from 'babylonjs';

export class BBTest
{
    private _engine:BABYLON.Engine = null;
    private _scene:BABYLON.Scene = null;
    private _camera:BABYLON.FreeCamera = null;
    private _light:BABYLON.HemisphericLight = null;
    private _canvas:HTMLCanvasElement = null;


    public constructor(canvas:HTMLCanvasElement)
    {
        this._canvas = canvas;
        this._engine = new BABYLON.Engine(canvas);
    }

    public createScene() : void
    {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), this._scene);

        let v3:BABYLON.Vector3 = BABYLON.Vector3.Zero();
        // Target the camera to scene origin.
        this._camera.setTarget(v3);

        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this._scene);

        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        let sphere = BABYLON.MeshBuilder.CreateSphere('sphere',
            {segments: 16, diameter: 2}, this._scene);

        // Move the sphere upward 1/2 of its height.
        sphere.position.y = 1;

        // Create a built-in "ground" shape.
        let ground = BABYLON.MeshBuilder.CreateGround('ground',
            {width: 6, height: 6, subdivisions: 2}, this._scene);
    }

    public doRender() : void
    {
        // Run the render loop.
        this._engine.runRenderLoop(() =>
        {
            this._scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}