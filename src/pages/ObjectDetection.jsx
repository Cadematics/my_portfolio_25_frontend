import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // must import once globally
import { motion } from "framer-motion";

export default function ObjectDetection() {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState(""); // "image" | "camera"
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load model on mount
  useEffect(() => {
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
      setIsLoading(false);
    });
    return () => stopCamera();
  }, []);

  // Stop camera if page changes
  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setMode("");
    }
  }

  // 🔹 Handle image upload
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setMode("image");
    setResults([]);
    setTimeout(() => detectImage(), 300); // wait for image to load
  }

  // 🔹 Run detection on uploaded image
  async function detectImage() {
    if (!model) return;
    const img = document.getElementById("uploaded-img");
    const predictions = await model.detect(img);
    drawPredictions(predictions, img);
  }

  // 🔹 Start webcam mode
  async function startCamera() {
    stopCamera();
    setMode("camera");
    setResults([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        detectCamera();
      };
    } catch (err) {
      alert("Camera access denied or not available.");
      console.error(err);
    }
  }

  // 🔹 Detect continuously on webcam
  async function detectCamera() {
    if (!model || !videoRef.current) return;
    const predictions = await model.detect(videoRef.current);
    drawPredictions(predictions, videoRef.current);
    requestAnimationFrame(detectCamera); // loop
  }

  // 🔹 Draw predictions on canvas
  function drawPredictions(predictions, sourceEl) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = sourceEl.width || sourceEl.videoWidth;
    canvas.height = sourceEl.height || sourceEl.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.font = "16px sans-serif";

    predictions.forEach((p) => {
      const [x, y, w, h] = p.bbox;
      ctx.strokeStyle = "#00FF00";
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = "#00FF00";
      ctx.fillText(`${p.class} (${(p.score * 100).toFixed(1)}%)`, x, y > 10 ? y - 5 : y + 15);
    });

    setResults(predictions);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start gap-6 py-8 px-4">
      <h1 className="text-3xl font-bold text-center">Real-Time Object Detection (YOLO / COCO-SSD)</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading model...</p>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap justify-center">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>

            <button
              onClick={startCamera}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Start Camera
            </button>

            <button
              onClick={stopCamera}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Stop Camera
            </button>
          </div>

          <div className="relative mt-6 w-full max-w-3xl aspect-video border rounded overflow-hidden bg-black">
            {mode === "image" && preview && (
              <img
                id="uploaded-img"
                src={preview}
                alt="uploaded"
                className="object-contain w-full h-full"
                onLoad={detectImage}
              />
            )}
            {mode === "camera" && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="object-contain w-full h-full"
              />
            )}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>

          <div className="mt-6 w-full max-w-3xl bg-white dark:bg-gray-800 rounded p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">Detections</h2>
            {!results.length ? (
              <p className="text-gray-500">No detections yet.</p>
            ) : (
              <ul className="text-sm grid gap-1">
                {results.map((r, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {r.class} — {(r.score * 100).toFixed(1)}%
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
