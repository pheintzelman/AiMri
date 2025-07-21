# Overview

AiMri is a tool for visulizing AI models. The concept is to build an MRI like visualzation of AI models in order to be able to watch how prompts progate through the model.

Two core goals:

1. To help people learn how LLM's work allowing people to get hands on experence and visualize the steps a prompt goes through one step at a time.
2. Assist researchers and the AI community get a deeper understanding of what is going on inside AI models. Allowing editing/labeling/orgnizing weights to gain deeper insights

# Why an Mri and challanges with this approach

Most popular AI models are neural networks. Although designed based on our brains they work quite differently. These models generally lack sparcity and localazation which makes making a tool exactly like an MRI impractical. So the focus is on being able to make trageting prompts and see activity in order to gain understanding in a similar way to how nurologist study our brain.

# Note

Currently this uses chatgpt2 small which is open sourced it has a similar archtecture to chatgpt4 but is much smaller. Feel free to switch the model, you will need to change the code to do this.

# Backend

## Overview

This backend uses transformerLens and pytorch to get data about what is happening inside of a model.

## To Run

```
uvicorn backend.app:app --reload --port 8000
```

## Docker

```sh
docker compose -f backend/docker-compose.yml up --build
```

Test

```sh
curl -X POST http://localhost:8000/attention \
  -H "Content-Type: application/json" \
  -d '{"text": "The cat sat on the mat."}' \
```

# Change log

## 0.2.0

View attention per token

## 0.1.0

View activations in a prompt by layer and token
