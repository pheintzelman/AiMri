from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import torch
import transformer_lens
from transformer_lens import HookedTransformer
from backend.constants import subLayer
from backend.attention import analyze_attention
import numpy as np
import asyncio


modelName = {
    'gpt2': 'gpt2',
    'gpt2Small': 'gpt2-small'
}

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = HookedTransformer.from_pretrained(modelName['gpt2Small'])

# ==== Data Models ====
class PromptRequest(BaseModel):
    prompt: str

class NodeEdit(BaseModel):
    layer: int
    neuron_index: int
    new_weight: Optional[float] = None
    deactivate: bool = False

# In-memory stores for versions and tags
versions: Dict[str, Dict[str, Any]] = {}
node_tags: Dict[str, List[Dict[str, Any]]] = {}

# ==== Routes ====
@app.get("/layers")
def get_model_structure():
    return {
        "num_layers": model.cfg.n_layers,
        "sub_layers": subLayer,
        "d_model": model.cfg.d_model,
        "d_mlp": model.cfg.d_mlp,
        "n_heads": model.cfg.n_heads
    }

@app.post("/tokens")
def get_tokens(request: PromptRequest):
    try:
        # Tokenize the input prompt
        prompt = request.prompt
        print(f"Prompt as repr: {repr(prompt)}")
        token_ids = model.to_tokens(prompt)[0]
        token_strs = model.to_str_tokens(prompt)

        tokens_with_metadata = []
        for idx, (token_id, token_str) in enumerate(zip(token_ids, token_strs)):
            tokens_with_metadata.append({
                "index": idx,
                "id": token_id.item(),
                "token": token_str
            })

        return {"tokens": tokens_with_metadata}
    except Exception as e:
        print(f"Error getting tokens: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/activate")
async def get_activations(request: PromptRequest):
    try:
        print(list(model.hook_dict.keys()))
        all_data = {}

        def sanitize_tensor(tensor):
            # Replace NaN and infinite values with 0 (or another fallback like 1e6 if you want)
            tensor = torch.nan_to_num(tensor, nan=0.0, posinf=1e6, neginf=-1e6)
            return tensor.cpu().tolist()

        def get_hook(prompt, layer):
            def record(activation, hook):
                key = f"{hook.name}"
                cleaned = sanitize_tensor(activation.detach())
                all_data.setdefault(prompt, {})[key] = cleaned
            return record

        prompt = request.prompt
        model.reset_hooks(including_permanent=True)
        model.cache = None

        hooks = []
        for layer in range(model.cfg.n_layers):
            for sublayer_key, sublayer_info in subLayer.items():
                hook_name = f"blocks.{layer}.{sublayer_info['name']}"
                hooks.append((hook_name, get_hook(prompt, layer)))
        
        _ = model.run_with_hooks(prompt, fwd_hooks=hooks)
        
        return {"activations": all_data}
    except Exception as e:
        print(f"Error during activation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/attention")
async def attention_route(request: PromptRequest):
    print("Received request")
    prompt = request.prompt
    print("Text:", prompt)

    if not prompt:
        return {"error": "Please provide text in JSON payload like {'text': 'some input'}"}

    results = analyze_attention(model, prompt)
    return results

@app.post("/edit")
def edit_node(edit: NodeEdit):
    try:
        with torch.no_grad():
            if edit.deactivate:
                model.blocks[edit.layer].mlp.W_out[:, edit.neuron_index] = 0
            elif edit.new_weight is not None:
                model.blocks[edit.layer].mlp.W_out[:, edit.neuron_index] = edit.new_weight
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    