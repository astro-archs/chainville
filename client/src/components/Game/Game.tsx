import React, { useEffect, useRef, useState } from 'react';
import {
  Scene, 
  Engine, 
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  CubeTexture,
  Texture,
  Color4
} from "@babylonjs/core";
import { CellData, GridSystem } from './GridSystem';
import { CameraController } from './CameraController';
import { ChainVilleUI } from './ChainVilleUI';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(0);
  const sceneRef = useRef<Scene | null>(null);
  const gridSystemRef = useRef<GridSystem | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedCellData, setSelectedCellData] = useState<CellData | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  
  // Set up auto-incrementing counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update scene metadata when counter changes
  useEffect(() => {
    if (sceneRef.current) {
      // sceneRef.current.metadata = {
      //   ...sceneRef.current.metadata,
      //   counter: counter
      // };
      console.log(`Updated scene metadata counter to: ${counter}`);
    }
  }, [counter]);
  
  // Main scene setup - runs only once
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Babylon Engine
    const engine = new Engine(canvasRef.current, true);
    
    // Create the scene
    const scene = new Scene(engine);
    sceneRef.current = scene;
    
    // Initialize metadata
    scene.metadata = {
      counter: counter
    };
    
    // Setup basic elements
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      20,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    
    // Create a basic light
    const light = new HemisphericLight(
      'light',
      new Vector3(0, 1, 0),
      scene
    );

    light.intensity = 0.7;
    
    // Create a ground plane
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 100, height: 100 },
      scene
    );

    const base = MeshBuilder.CreateBox("base", {
      width: 100,
      height: 2,  // Thickness of the ground
      depth: 100
    }, scene);
    base.position.y = -1; // Lower it so the top is at y = 0

    const baseMaterial = new StandardMaterial('groundMaterial', scene);
    baseMaterial.diffuseColor = new Color3(0.8, 0.6, 0.4);
    base.material = baseMaterial;
    
    
    // Warm amber/brown material for ground
    const groundMaterial = new StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new Color3(0.8, 0.6, 0.4);
    ground.material = groundMaterial;

   scene.clearColor = new Color3(0.8, 0.6, 0.4).toColor4(1);

      const cameraController = new CameraController(
        scene,
        camera,
        {
          moveSpeed: 0.5,
          rotationSpeed: 0.05,
          zoomSpeed: 0.1
        }
      );
      cameraControllerRef.current = cameraController;

        // Create grid system
        const gridSystem = new GridSystem(
          scene,
          {
            districtGridSize: 6,
            districtSize: 10,
            districtSpacing: 10,
            cellsPerDistrict: 30,
            cellSpacing: 0.0001
          },
          {
            onDistrictSelected: (districtId) => {
              setSelectedDistrict(districtId);
              setSelectedCell(null);
              setSelectedCellData(null);
            },
            onCellSelected: (cellId, cellData) => {
              setSelectedCell(cellId);
              setSelectedCellData(cellData);
            }
          }
        );

        gridSystemRef.current = gridSystem;
        

        const chainVilleGui = new ChainVilleUI(scene);

        // if (scene.activeCamera){
        //   scene.createDefaultSkybox(scene.environmentTexture, true, (scene.activeCamera.maxZ - scene.activeCamera.minZ)/2, 0.3, false);
        // }

    // // Log metadata counter every 100 frames
    // scene.onBeforeRenderObservable.add(() => {
    //   if (scene.getFrameId() % 100 === 0) {
    //     console.log(`Current counter in scene metadata: ${scene.metadata.counter}`);
    //   }
    // });
   

    
    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
    
    // Handle window resize
    const resizeListener = () => {
      engine.resize();
    };
    
    window.addEventListener('resize', resizeListener);
    
    // Set loading to false after a short delay to ensure everything is ready
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', resizeListener);
      engine.dispose();
      scene.dispose();
    };
  }, []); // Empty dependency array - only run once
  
  const spinnerStyle = {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '4px solid #ffffff',
    width: '40px',
    height: '40px',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite'
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          outline: 'none',
          touchAction: 'none' 
        }} 
      />

      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={spinnerStyle}></div>
            <h2>Loading Game...</h2>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default Game;