import { useLoader } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

export default function Model({ url, onMeshClick, selectedMesh }) {
  const groupRef = useRef();
  const ext = url.split(".").pop().toLowerCase();

  let scene = null;
  if (ext === "glb" || ext === "gltf") {
    const gltf = useLoader(GLTFLoader, url);
    scene = gltf.scene;
    // ✅ Ensure each mesh has a unique material
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });
  } else if (ext === "obj") {
    const obj = useLoader(OBJLoader, url);
    scene = obj;
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });
  } else if (ext === "stl") {
    const geom = useLoader(STLLoader, url);
    const mesh = new THREE.Mesh(
      geom,
      new THREE.MeshStandardMaterial({ color: "#aaaaaa" })
    );
    scene = new THREE.Group();
    scene.add(mesh);
  }

  // 🔍 Debug: list all meshes
  console.log("Scene structure:");
  scene?.traverse((child) => {
    if (child.isMesh) console.log("Mesh:", child.name);
  });

  // ✨ Highlight selected mesh
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh) {
        if (selectedMesh && child.name === selectedMesh.name) {
          if (!child.material.emissive) {
            child.material.emissive = new THREE.Color("#00ffff");
          }
          child.material.emissiveIntensity = 0.6;
        } else if (child.material.emissive) {
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [selectedMesh, scene]);

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.object.isMesh) {
          onMeshClick(e.object);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!selectedMesh || e.object.name !== selectedMesh.name) {
          e.object.material.emissive = new THREE.Color("#ffaa00");
          e.object.material.emissiveIntensity = 0.3;
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (!selectedMesh || e.object.name !== selectedMesh.name) {
          e.object.material.emissiveIntensity = 0;
        }
      }}
    >
      {scene && <primitive object={scene} />}
    </group>
  );
}

// import { useLoader } from "@react-three/fiber";
// import { useRef, useEffect } from "react";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
// import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
// import * as THREE from "three";

// export default function Model({ url, onMeshClick, selectedMesh }) {
//   const groupRef = useRef();
//   const ext = url.split(".").pop().toLowerCase();

//   // Load model based on extension
//   let scene = null;
//   if (ext === "glb" || ext === "gltf") {
//     const gltf = useLoader(GLTFLoader, url);
//     scene = gltf.scene;
//   } else if (ext === "obj") {
//     const obj = useLoader(OBJLoader, url);
//     scene = obj;
//   } else if (ext === "stl") {
//     const geom = useLoader(STLLoader, url);
//     const mesh = new THREE.Mesh(
//       geom,
//       new THREE.MeshStandardMaterial({ color: "#aaaaaa" })
//     );
//     scene = new THREE.Group();
//     scene.add(mesh);
//   }

//   console.log("Scene structure:");
// scene.traverse((child) => {
//   if (child.isMesh) console.log("Mesh:", child.name);
// });

//   // Highlight selected mesh
//   useEffect(() => {
//     if (!selectedMesh || !scene) return;



    
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         if (child.name === selectedMesh.name) {
//           if (!child.material.emissive) {
//             child.material.emissive = new THREE.Color("#00ffff");
//           }
//           child.material.emissive.set("#00ffff");
//           child.material.emissiveIntensity = 0.6;
//         } else if (child.material.emissive) {
//           child.material.emissiveIntensity = 0;
//         }
//         child.material.needsUpdate = true;
//       }
//     });
//   }, [selectedMesh, scene]);

//   return (
//     <group
//       ref={groupRef}
//       onPointerDown={(e) => {
//         e.stopPropagation();
//         if (e.object.isMesh) {
//           onMeshClick(e.object);
//         }
//       }}
//     >
//       {scene && <primitive object={scene} />}
//     </group>
//   );
// }
