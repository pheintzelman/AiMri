import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ActivationLayer({ activations }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!activations || !activations.length) return;

    const width = 800;
    const height = 600;
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0.5, 0.5, 0.5);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    const neuronSize = 0.2;
    const spacing = neuronSize * 2.5;
    const gray = 0.5;

    const N = Math.ceil(Math.sqrt(activations.length));

    // Create a group for all neurons so we can rotate it
    const neuronGroup = new THREE.Group();

    activations.forEach((val, idx) => {
      let colorValue;
      if (val >= 0) {
        colorValue = gray + val * (1 - gray);
      } else {
        colorValue = gray + val * gray;
      }
      colorValue = Math.min(Math.max(colorValue, 0), 1);

      const color = new THREE.Color(colorValue, colorValue, colorValue);
      const geometry = new THREE.SphereGeometry(neuronSize, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);

      const x = (idx % N) * spacing;
      const y = Math.floor(idx / N) * spacing;

      sphere.position.set(x, y, 0);
      neuronGroup.add(sphere);
    });

    // Rotate the whole neuron group around the X axis ~30 degrees (π/6)
    neuronGroup.rotation.y = Math.PI / 4;

    // Add the group to the scene
    scene.add(neuronGroup);

    // Position camera to see the group nicely
    camera.position.set((N * spacing) / 2, (N * spacing) / 2, N * spacing);
    camera.lookAt((N * spacing) / 2, (N * spacing) / 2, 0);

    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
    };
  }, [activations]);

  return <div ref={mountRef} />;
}
