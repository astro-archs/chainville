import {
    Scene,
    ArcRotateCamera,
    Vector3,
    KeyboardEventTypes
  } from "@babylonjs/core";
  
  /**
   * Configuration options for CameraController
   */
  export interface CameraControllerOptions {
    /** Camera movement speed */
    moveSpeed?: number;
    /** Camera rotation speed */
    rotationSpeed?: number;
    /** Camera zoom speed */
    zoomSpeed?: number;
  }
  
  /**
   * CameraController class to add keyboard controls to an existing camera
   */
  export class CameraController {
    private scene: Scene;
    private camera: ArcRotateCamera;
    
    // Key states
    private keys: { [key: string]: boolean } = {
      w: false, 
      s: false, 
      a: false, 
      d: false, 
      q: false, 
      e: false, 
      r: false, 
      f: false
    };
    
    // Configuration
    private moveSpeed: number;
    private rotationSpeed: number;
    private zoomSpeed: number;
    

    /**
     * Create a new CameraController for an existing camera
     * @param scene Babylon.js Scene
     * @param camera Existing ArcRotateCamera to control
     * @param options Controller configuration options
     */
    constructor(
      scene: Scene,
      camera: ArcRotateCamera,
      options: CameraControllerOptions = {}
    ) {
      this.scene = scene;
      this.camera = camera;
      
      // Default options
      const {
        moveSpeed = 0.5,
        rotationSpeed = 0.05,
        zoomSpeed = 0.1,
      } = options;
      
      // Store configuration
      this.moveSpeed = moveSpeed;
      this.rotationSpeed = rotationSpeed;
      this.zoomSpeed = zoomSpeed;
      
      // Set up keyboard controls
      this.setupKeyboardControls();
    }
    
    /**
     * Set up keyboard controls for the camera
     */
    private setupKeyboardControls(): void {
      // Add keyboard observer
    this.scene.onKeyboardObservable.add((kbInfo) => {
        const key = kbInfo.event.key.toLowerCase();
        if (key in this.keys) {
          this.keys[key] = kbInfo.type === KeyboardEventTypes.KEYDOWN;
        }
      });
      
      // Add render observer for continuous movement
      this.scene.onBeforeRenderObservable.add(() => {
        this.updateCameraPosition();
      });
    }
    
    /**
     * Update camera position based on keyboard input
     */
    private updateCameraPosition(): void {
      let cameraSpeed = Vector3.Zero();
      
      // Get camera's actual viewing direction in world space
      const forward = this.camera.getTarget().subtract(this.camera.position).normalize();
      forward.y = 0; // Project onto XZ plane
      forward.normalize();
      
      // Get right vector from forward
      const right = Vector3.Cross(forward, Vector3.Up()).normalize();
      
      // Movement
      if (this.keys['w']) cameraSpeed.addInPlace(forward.scale(this.moveSpeed));
      if (this.keys['s']) cameraSpeed.addInPlace(forward.scale(-this.moveSpeed));
      if (this.keys['d']) cameraSpeed.addInPlace(right.scale(-this.moveSpeed));
      if (this.keys['a']) cameraSpeed.addInPlace(right.scale(this.moveSpeed));
      
      // Apply movement
      this.camera.target.addInPlace(cameraSpeed);
      
      // Rotation and zoom
      if (this.keys['q']) this.camera.alpha += this.rotationSpeed;
      if (this.keys['e']) this.camera.alpha -= this.rotationSpeed;
      if (this.keys['r']) this.camera.radius -= this.zoomSpeed;
      if (this.keys['f']) this.camera.radius += this.zoomSpeed;
      
      // Ensure radius stays within limits
      if (this.camera.lowerRadiusLimit !== null && this.camera.upperRadiusLimit !== null) {
        this.camera.radius = Math.max(
          this.camera.lowerRadiusLimit, 
          Math.min(this.camera.radius, this.camera.upperRadiusLimit)
        );
      }
    }
    
    /**
     * Set camera movement speed
     * @param speed New movement speed
     */
    public setMoveSpeed(speed: number): void {
      this.moveSpeed = speed;
    }
    
    /**
     * Set camera rotation speed
     * @param speed New rotation speed
     */
    public setRotationSpeed(speed: number): void {
      this.rotationSpeed = speed;
    }
    
    /**
     * Set camera zoom speed
     * @param speed New zoom speed
     */
    public setZoomSpeed(speed: number): void {
      this.zoomSpeed = speed;
    }
    
    /**
     * Focus camera on a specific world position
     * @param position Position to focus on
     */
    public focusOn(position: Vector3): void {
      this.camera.setTarget(position);
    }
    
    /**
     * Dispose the camera controller
     */
    public dispose(): void {
      // Remove observers

    }
  }