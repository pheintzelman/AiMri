import { useEffect, useState } from "react";
import { fetchActivations } from "../services/api";
import ActivationLayer from "../components/ActivationLayer";
import LayerSelector from "./LayerSelector";

function ActivationLayerContainer() {
  const [activations, setActivations] = useState();
  const [currentActivations, setCurrentActivations] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState({ layer: 0, token: 0 });

  const prompt = "The cat sat on the mat.";
  const layer = 0;

  useEffect(() => {
    async function load() {
      const data = await fetchActivations(prompt);
      setActivations(data);
    }
    load();
  }, []);

  useEffect(() => {
    if (!activations) return;

    const { layer, token, sublayer } = selectedLayer;
    console.log({ sublayer });
    const input = activations[prompt][`blocks.${layer}.${sublayer}`];
    const currentActivations = input[0][token]; // Only show first token
    setCurrentActivations(currentActivations);
  }, [selectedLayer, activations]);

  return (
    <div>
      <div className="text-lg font-semibold mb-2">Activation Viewer</div>
      <LayerSelector prompt={prompt} onChange={setSelectedLayer} />
      <ActivationLayer activations={currentActivations} />
    </div>
  );
}

export default ActivationLayerContainer;
