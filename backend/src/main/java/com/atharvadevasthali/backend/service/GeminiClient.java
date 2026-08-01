package com.atharvadevasthali.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Thin wrapper around Google's Gemini REST API for the two calls this app
 * needs: text embeddings (for the recipe vector index) and text generation
 * (for RAG-style answers grounded in retrieved recipes).
 */
@Service
public class GeminiClient {

    // Model ids are substituted into a single {model} URI template variable below,
    // so they must NOT contain a literal "/" — RestClient's UriTemplate percent-encodes
    // slashes inside a variable's value (it doesn't know it should span path segments),
    // which turned "models/gemini-embedding-001" into "models%2Fgemini-embedding-001"
    // and made every call 404 against Google's API. The "models/" prefix is baked into
    // the URI template string itself instead.
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
    private static final String EMBEDDING_MODEL = "gemini-embedding-001";
    private static final String GENERATION_MODEL = "gemini-2.5-flash";
    private static final int EMBEDDING_DIMENSIONS = 768;

    private final RestClient restClient;
    private final String apiKey;

    public GeminiClient(@Value("${gemini.api.key:}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder().baseUrl(BASE_URL).build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public float[] embed(String text) {
        EmbedRequest request = new EmbedRequest(new Content(List.of(new Part(text))), EMBEDDING_DIMENSIONS);
        EmbedResponse response = restClient.post()
                .uri("/{model}:embedContent?key={key}", EMBEDDING_MODEL, apiKey)
                .body(request)
                .retrieve()
                .body(EmbedResponse.class);

        if (response == null || response.embedding() == null) {
            throw new IllegalStateException("Gemini embedding response was empty");
        }
        List<Double> values = response.embedding().values();
        float[] result = new float[values.size()];
        for (int i = 0; i < values.size(); i++) result[i] = values.get(i).floatValue();
        return result;
    }

    public String generate(String prompt) {
        GenerateRequest request = new GenerateRequest(List.of(new Content(List.of(new Part(prompt)))));
        GenerateResponse response = restClient.post()
                .uri("/{model}:generateContent?key={key}", GENERATION_MODEL, apiKey)
                .body(request)
                .retrieve()
                .body(GenerateResponse.class);

        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return "";
        }
        Content content = response.candidates().get(0).content();
        if (content == null || content.parts() == null || content.parts().isEmpty()) return "";
        return content.parts().get(0).text();
    }

    // ── Request/response shapes ──────────────────────────────────────────

    private record Part(String text) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Content(List<Part> parts) {}

    private record EmbedRequest(Content content, int outputDimensionality) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record EmbedResponse(Embedding embedding) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Embedding(List<Double> values) {}

    private record GenerateRequest(List<Content> contents) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GenerateResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Candidate(Content content) {}
}
