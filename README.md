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
