package com.demo.annonces.annonce;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * End to end on the in-memory H2. The Spring context — and therefore the database — is shared with
 * the other @SpringBootTest classes, so this asserts on the annonces it creates itself, never on the
 * total size of the list.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AnnonceListIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsCreatedAnnoncesMostRecentFirst() throws Exception {
        create("Tondeuse thermique", "MAISON", "Tondeuse thermique révisée, tourne au premier démarrage.");
        create("Guitare folk", "LOISIRS", "Guitare folk avec housse et accordeur, très peu jouée.");

        String body = mockMvc.perform(get("/api/annonces"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        List<String> titles = JsonPath.read(body, "$[*].title");
        assertThat(titles).contains("Guitare folk", "Tondeuse thermique");
        // created last, so listed first
        assertThat(titles.indexOf("Guitare folk")).isLessThan(titles.indexOf("Tondeuse thermique"));
        assertThat(titles.get(0)).isEqualTo("Guitare folk");
    }

    private void create(String title, String category, String description) throws Exception {
        String body = """
                {
                  "title": "%s",
                  "category": "%s",
                  "description": "%s",
                  "price": 90,
                  "city": "Rennes",
                  "postalCode": "35000"
                }
                """.formatted(title, category, description);
        mockMvc.perform(post("/api/annonces").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }
}
