import { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function Model({ url, materialProps }) {
  const ext = url.split(".").pop().toLowerCase();

  if (ext === "glb" || ext === "gltf") {
    const gltf = useLoader(GLTFLoader, url);
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial(materialProps);
      }
    });
    return <primitive object={gltf.scene} />;
  } else if (ext === "obj") {
    const obj = useLoader(OBJLoader, url);
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial(materialProps);
      }
    });
    return <primitive object={obj} />;
  } else if (ext === "stl") {
    const geom = useLoader(STLLoader, url);
    return (
      <mesh geometry={geom}>
        <meshStandardMaterial attach="material" {...materialProps} />
      </mesh>
    );
  } else {
    return <></>;
  }
}

function ModelViewer() {
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");

  // material controls
  const [color, setColor] = useState("#a0a0a0");
  const [metalness, setMetalness] = useState(0.3);
  const [roughness, setRoughness] = useState(0.7);

  // lighting controls
  const [ambientIntensity, setAmbientIntensity] = useState(0.6);
  const [dirIntensity, setDirIntensity] = useState(1);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setFileUrl("");

    const form = new FormData();
    form.append("file", file);

    try {
      const r = await fetch(`${API}/api/upload-model/`, { method: "POST", body: form });
      if (!r.ok) {
        const text = await r.text();
        setError("Upload failed: " + text);
        console.error("Upload failed:", text);
        return;
      }
      const data = await r.json();
      const fullUrl = `${API}${data.file_url}`;
      setFileUrl(fullUrl);
    } catch (err) {
      console.error("Error uploading:", err);
      setError("An error occurred while uploading.");
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">3D Model Visualizer</h1>

      <input
        type="file"
        accept=".glb,.gltf,.obj,.stl"
        onChange={handleUpload}
        className="mb-4"
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Material Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded">
        <div>
          <label className="text-sm block mb-1">Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <div>
          <label className="text-sm block mb-1">Metalness: {metalness.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={metalness}
            onChange={(e) => setMetalness(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Roughness: {roughness.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Ambient Light: {ambientIntensity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={ambientIntensity}
            onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Directional Light: {dirIntensity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={dirIntensity}
            onChange={(e) => setDirIntensity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="border rounded h-[500px] bg-gray-50 dark:bg-gray-900">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={[5, 5, 5]} intensity={dirIntensity} />
          <OrbitControls />
          {fileUrl && (
            <Model
              url={fileUrl}
              materialProps={{ color, metalness, roughness }}
            />
          )}
        </Canvas>
      </div>
    </div>
  );
}

export default ModelViewer;
