import { useState, useEffect, useRef } from "react";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import Model from "../components/Model";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function CameraViewControls({ currentView }) {
  const { camera } = useThree();
  useEffect(() => {
    const distance = 3;
    switch (currentView) {
      case "front":
        camera.position.set(0, 0, distance);
        break;
      case "back":
        camera.position.set(0, 0, -distance);
        break;
      case "top":
        camera.position.set(0, distance, 0);
        break;
      case "bottom":
        camera.position.set(0, -distance, 0);
        break;
      case "left":
        camera.position.set(-distance, 0, 0);
        break;
      case "right":
        camera.position.set(distance, 0, 0);
        break;
      default:
        camera.position.set(2, 2, 2);
        break;
    }
    camera.lookAt(0, 0, 0);
  }, [currentView, camera]);
  return null;
}

function HDRIEnvironment({ hdriUrl, intensity }) {
  const texture = useLoader(RGBELoader, hdriUrl);
  const { scene } = useThree();
  useEffect(() => {
    if (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
    }
  }, [texture, scene]);
  useEffect(() => {
    if (scene.environment) scene.environment.intensity = intensity;
  }, [intensity, scene]);
  return null;
}

export default function ModelViewer() {
  const canvasRef = useRef();
  const [models, setModels] = useState([]);
  const [error, setError] = useState("");
  const [bgColor, setBgColor] = useState("#111111");
  const [useHDRI, setUseHDRI] = useState(false);
  const [hdriFile, setHdriFile] = useState(null);
  const [hdriUrl, setHdriUrl] = useState("");
  const [hdriIntensity, setHdriIntensity] = useState(1.0);
  const [ambientIntensity, setAmbientIntensity] = useState(0.6);
  const [dirIntensity, setDirIntensity] = useState(1);
  const [dirX, setDirX] = useState(5);
  const [dirY, setDirY] = useState(5);
  const [dirZ, setDirZ] = useState(5);
  const [currentView, setCurrentView] = useState("free");
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [meshColor, setMeshColor] = useState("#ffffff");
  const [meshMetalness, setMeshMetalness] = useState(0.3);
  const [meshRoughness, setMeshRoughness] = useState(0.7);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setSelectedMesh(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const r = await fetch(`${API}/api/upload-model/`, { method: "POST", body: form });
      if (!r.ok) {
        const text = await r.text();
        setError("Upload failed: " + text);
        return;
      }
      const data = await r.json();
      const fullUrl = `${API}${data.file_url}`;
      setModels((prev) => [...prev, { url: fullUrl, name: file.name }]);
    } catch {
      setError("An error occurred while uploading.");
    }
  }

  function handleRemoveModel(index) {
    setModels((prev) => prev.filter((_, i) => i !== index));
    setSelectedMesh(null);
  }

  function handleMeshClick(mesh) {
    setSelectedMesh(mesh);
    if (mesh.material) {
      setMeshColor(`#${mesh.material.color.getHexString()}`);
      setMeshMetalness(mesh.material.metalness ?? 0.3);
      setMeshRoughness(mesh.material.roughness ?? 0.7);
    }
    setPosX(mesh.position.x);
    setPosY(mesh.position.y);
    setPosZ(mesh.position.z);
  }

  useEffect(() => {
    if (selectedMesh && selectedMesh.material) {
      selectedMesh.material.color.set(meshColor);
      selectedMesh.material.metalness = meshMetalness;
      selectedMesh.material.roughness = meshRoughness;
      selectedMesh.material.needsUpdate = true;
    }
  }, [meshColor, meshMetalness, meshRoughness, selectedMesh]);

  useEffect(() => {
    if (selectedMesh) selectedMesh.position.set(posX, posY, posZ);
  }, [posX, posY, posZ, selectedMesh]);

  function handleHDRIUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setHdriFile(file);
      const url = URL.createObjectURL(file);
      setHdriUrl(url);
      setUseHDRI(true);
    }
  }

 // 🟢 Replace your current takeScreenshot() function:
function takeScreenshot() {
  const glCanvas = canvasRef.current?.querySelector("canvas");
  if (!glCanvas) return;

  const image = glCanvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = image;
  a.download = "model_snapshot.png";
  a.click();
}
  return (
    <div className="fixed inset-0 bg-gray-900 text-white">
      <div className="absolute top-4 left-4 w-72 bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-lg p-4 space-y-4 z-10 overflow-y-auto max-h-[95vh]">
        <h2 className="text-lg font-semibold mb-2">Upload Model</h2>
        <input
          type="file"
          accept=".glb,.gltf,.obj,.stl"
          onChange={handleUpload}
          className="block w-full text-sm text-gray-200 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 hover:file:bg-blue-700"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {models.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-1">Loaded Models</h2>
            <ul className="space-y-1 text-sm">
              {models.map((m, i) => (
                <li key={i} className="flex justify-between items-center bg-gray-700/60 px-2 py-1 rounded">
                  <span className="truncate">{m.name}</span>
                  <button onClick={() => handleRemoveModel(i)} className="text-red-400 hover:text-red-300 text-xs">
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <h2 className="text-lg font-semibold mt-4 mb-2">Views</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Free", view: "free" },
                { label: "Front", view: "front" },
                { label: "Top", view: "top" },
                { label: "Right", view: "right" },
                { label: "Left", view: "left" },
                { label: "Back", view: "back" },
              ].map(({ label, view }) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`py-1 rounded text-sm font-semibold ${
                    currentView === view ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={takeScreenshot}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-sm font-semibold py-1 rounded"
            >
              📸 Take Snapshot
            </button>

            <h2 className="text-lg font-semibold mt-4 mb-2">Environment</h2>
            <label className="text-sm block mb-1">Background Color</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />

            <div className="mt-2">
              <button
                onClick={() => setUseHDRI((p) => !p)}
                className={`w-full text-sm font-semibold py-1 rounded ${
                  useHDRI ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {useHDRI ? "Disable HDRI" : "Use HDRI Lighting"}
              </button>
            </div>

            {useHDRI && (
              <div className="mt-2 space-y-2">
                <label className="text-sm block">Upload HDRI (.hdr)</label>
                <input
                  type="file"
                  accept=".hdr"
                  onChange={handleHDRIUpload}
                  className="block w-full text-sm text-gray-200"
                />
                {hdriUrl && (
                  <>
                    <label className="text-sm block">
                      HDRI Intensity: {hdriIntensity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={hdriIntensity}
                      onChange={(e) => setHdriIntensity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </>
                )}
              </div>
            )}

            <h2 className="text-lg font-semibold mt-4 mb-2">Lighting</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm block">
                  Ambient Intensity: {ambientIntensity.toFixed(2)}
                </label>
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
                <label className="text-sm block">
                  Directional Intensity: {dirIntensity.toFixed(2)}
                </label>
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

            {selectedMesh && (
              <>
                <h2 className="text-lg font-semibold mt-4 mb-2">
                  Selected: {selectedMesh.name || "Unnamed Mesh"}
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm block">Color</label>
                    <input type="color" value={meshColor} onChange={(e) => setMeshColor(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm block">
                      Metalness: {meshMetalness.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={meshMetalness}
                      onChange={(e) => setMeshMetalness(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm block">
                      Roughness: {meshRoughness.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={meshRoughness}
                      onChange={(e) => setMeshRoughness(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-md font-semibold mb-1">Position</h3>
                    {[
                      { label: "X", val: posX, set: setPosX },
                      { label: "Y", val: posY, set: setPosY },
                      { label: "Z", val: posZ, set: setPosZ },
                    ].map(({ label, val, set }) => (
                      <div key={label}>
                        <label className="text-xs block">
                          {label}: {val.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          step="0.1"
                          value={val}
                          onChange={(e) => set(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div ref={canvasRef} className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ backgroundColor: bgColor }}
          gl={{ preserveDrawingBuffer: true }}
          onPointerMissed={(e) => {
            if (e.button === 0) setSelectedMesh(null);
          }}
        >
          <CameraViewControls currentView={currentView} />
          {!useHDRI && <ambientLight intensity={ambientIntensity} />}
          {!useHDRI && (
            <directionalLight position={[dirX, dirY, dirZ]} intensity={dirIntensity} />
          )}
          {useHDRI && hdriUrl && <HDRIEnvironment hdriUrl={hdriUrl} intensity={hdriIntensity} />}
          <OrbitControls enabled={currentView === "free"} />
          {models.map((m, i) => (
            <Model key={i} url={m.url} onMeshClick={handleMeshClick} selectedMesh={selectedMesh} />
          ))}
        </Canvas>
      </div>
    </div>
  );
}
