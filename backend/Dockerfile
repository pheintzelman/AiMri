FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python3 -c "from transformer_lens import HookedTransformer; HookedTransformer.from_pretrained('gpt2-small')"
COPY . .
CMD ["sh"]