import torch

def calc_entropy(probs):
   entropy = -torch.sum(probs * torch.log(probs + 1e-12)).item()
   return entropy


def process_head(model, layer, head, head_attn, token_strs, seq_len):
   attention_received = head_attn.sum(dim=0) / seq_len
   max_weight, max_idx = attention_received.max(0)
   max_token = token_strs[max_idx]

   tokens_info = []
   for i in range(seq_len):
       attention_given = head_attn[i]
       attn_given_probs = torch.nn.functional.softmax(attention_given, dim=0)
       ent = calc_entropy(attn_given_probs)

       token_info = {
           "value": token_strs[i],
           "attention": [
               {"token": token_strs[j], "weight": float(attn_given_probs[j].item())}
               for j in range(seq_len)
           ],
           "average_attention_received": float(attention_received[i].item()),
           "max_attention_received": {"token": max_token, "weight": float(max_weight.item())},
           "entropy": ent
       }
       tokens_info.append(token_info)

   return {
       "layer": layer,
       "head": head,
       "tokens": tokens_info
   }


def process_layer(model, layer, cache, token_strs, seq_len):
   key = f"blocks.{layer}.attn.hook_pattern"
   if key not in cache:
       print(f"Missing key in cache: {key}")
       return None

   attn_weights = cache[key].squeeze(0)  # (heads, seq_len, seq_len)
   layer_results = []

   for head in range(model.cfg.n_heads):
       layer_results.append(process_head(model, layer, head, attn_weights[head], token_strs, seq_len))

   return layer_results


def get_tokens_and_cache(model, text):
   tokens = model.to_tokens(text, prepend_bos=True)
   _, cache = model.run_with_cache(tokens)
   token_strs = model.to_str_tokens(tokens)

   print("tokens:", tokens)
   print("token_strs:", token_strs)

   return tokens, token_strs, cache


def analyze_attention(model, text):
   tokens, token_strs, cache = get_tokens_and_cache(model, text)
   seq_len = tokens.shape[1]

   results = []
   for layer in range(model.cfg.n_layers):
       layer_result = process_layer(model, layer, cache, token_strs, seq_len)
       if layer_result:
           results.extend(layer_result)

   return results
