package com.atharvadevasthali.backend;

import com.atharvadevasthali.backend.model.*;
import com.atharvadevasthali.backend.repository.RecipeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer {

    private final RecipeRepository recipeRepository;

    public DataInitializer(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }

    private static Ingredient ing(String name, String quantity) {
        return new Ingredient(name, quantity);
    }

    @PostConstruct
    public void loadData() {
        if (!recipeRepository.findByOwnerIsNull().isEmpty()) return;

        recipeRepository.saveAll(List.of(
            new Recipe("Tomato Pasta", 2,
                List.of(ing("pasta", "200 g"), ing("tomatoes", "3, chopped"), ing("onion", "1, diced"),
                        ing("garlic", "3 cloves, minced"), ing("olive oil", "2 tbsp"), ing("salt & pepper", "to taste")),
                List.of(
                    "Bring a large pot of salted water to a boil. Cook pasta until al dente, then drain and reserve ½ cup pasta water.",
                    "Heat olive oil in a pan over medium heat. Sauté onion for 3 minutes until soft, then add garlic for 1 minute.",
                    "Add chopped tomatoes, season with salt and pepper, and simmer for 10 minutes until the sauce thickens.",
                    "Toss the drained pasta into the sauce. Add a splash of pasta water if needed. Serve immediately."
                ),
                DietaryType.VEGETARIAN, CuisineType.ITALIAN
            ),
            new Recipe("Veggie Salad", 2,
                List.of(ing("lettuce", "1 head, torn"), ing("tomatoes", "2, diced"), ing("cucumber", "1, sliced"),
                        ing("olive oil", "3 tbsp"), ing("lemon juice", "1 tbsp"), ing("salt & pepper", "to taste")),
                List.of(
                    "Wash and dry all vegetables thoroughly.",
                    "Tear the lettuce into bite-sized pieces and place in a large salad bowl.",
                    "Add diced tomatoes and sliced cucumber on top.",
                    "Whisk together olive oil, lemon juice, salt, and pepper to make the dressing.",
                    "Drizzle dressing over the salad just before serving and toss gently."
                ),
                DietaryType.VEGAN, CuisineType.OTHER
            ),
            new Recipe("Garlic Bread", 4,
                List.of(ing("bread loaf", "1, sliced"), ing("butter", "4 tbsp, softened"),
                        ing("garlic", "4 cloves, minced"), ing("parsley", "2 tbsp, chopped")),
                List.of(
                    "Preheat oven to 180°C (350°F).",
                    "Mix softened butter with minced garlic and chopped parsley until well combined.",
                    "Spread the garlic butter generously on each slice of bread.",
                    "Arrange on a baking tray and bake for 10 minutes until golden and crispy at the edges.",
                    "Serve hot as a side dish or starter."
                ),
                DietaryType.VEGETARIAN, CuisineType.ITALIAN
            ),
            new Recipe("Classic Omelette", 1,
                List.of(ing("eggs", "3, beaten"), ing("onion", "½, finely diced"), ing("tomato", "1, diced"),
                        ing("butter", "1 tbsp"), ing("salt & pepper", "to taste")),
                List.of(
                    "Crack the eggs into a bowl, add salt and pepper, and beat well until combined.",
                    "Melt butter in a non-stick pan over medium heat.",
                    "Sauté onion for 2 minutes, then add tomato and cook for 1 more minute.",
                    "Pour the beaten eggs over the vegetables, spreading evenly.",
                    "Once the edges set, fold the omelette in half and cook for 30 more seconds. Slide onto a plate."
                ),
                DietaryType.VEGETARIAN, CuisineType.OTHER
            ),
            new Recipe("Chicken Stir Fry", 3,
                List.of(ing("chicken breast", "400 g, sliced thin"), ing("garlic", "4 cloves, minced"),
                        ing("onion", "1, sliced"), ing("bell pepper", "1, sliced"), ing("soy sauce", "3 tbsp"),
                        ing("sesame oil", "1 tbsp"), ing("oil", "2 tbsp")),
                List.of(
                    "Slice chicken thin and marinate in soy sauce for 15 minutes.",
                    "Heat oil in a wok or large pan over high heat.",
                    "Stir fry garlic for 30 seconds, then add onion and bell pepper for 2 minutes.",
                    "Add the marinated chicken and stir fry for 5–6 minutes until cooked through.",
                    "Drizzle sesame oil, toss everything together, and serve over steamed rice."
                ),
                DietaryType.NON_VEGETARIAN, CuisineType.ASIAN
            ),
            new Recipe("Cucumber Raita", 4,
                List.of(ing("cucumber", "1 large, grated"), ing("yogurt", "2 cups"), ing("garlic", "1 clove, minced"),
                        ing("cumin powder", "½ tsp"), ing("salt", "to taste"), ing("fresh mint", "a few leaves")),
                List.of(
                    "Grate the cucumber and squeeze out excess moisture using a clean cloth.",
                    "In a bowl, whisk the yogurt until smooth.",
                    "Mix in grated cucumber, minced garlic, cumin powder, and salt.",
                    "Garnish with fresh mint leaves and refrigerate for 10 minutes before serving.",
                    "Serve chilled alongside biryani, curry, or grilled meats."
                ),
                DietaryType.VEGETARIAN, CuisineType.INDIAN
            ),
            new Recipe("Pasta Aglio e Olio", 2,
                List.of(ing("spaghetti", "200 g"), ing("garlic", "6 cloves, thinly sliced"),
                        ing("olive oil", "4 tbsp"), ing("red chilli flakes", "½ tsp"), ing("parsley", "3 tbsp, chopped"),
                        ing("parmesan", "to serve"), ing("salt", "to taste")),
                List.of(
                    "Cook spaghetti in well-salted boiling water until al dente. Reserve 1 cup of pasta water before draining.",
                    "In a large pan, gently heat olive oil over low heat. Add sliced garlic and cook slowly until light golden — do not burn.",
                    "Add chilli flakes and stir for 30 seconds.",
                    "Add the drained pasta and a ladle of pasta water. Toss vigorously to emulsify the sauce.",
                    "Remove from heat, stir in chopped parsley, and serve with grated parmesan."
                ),
                DietaryType.VEGAN, CuisineType.ITALIAN
            ),
            new Recipe("Egg Fried Rice", 3,
                List.of(ing("cooked rice", "3 cups, day-old"), ing("eggs", "3, beaten"), ing("onion", "1, diced"),
                        ing("soy sauce", "2 tbsp"), ing("sesame oil", "1 tsp"), ing("oil", "2 tbsp"),
                        ing("spring onion", "2 stalks, chopped")),
                List.of(
                    "Use day-old refrigerated rice for best results — freshly cooked rice is too moist.",
                    "Heat oil in a wok over high heat. Scramble the beaten eggs and set aside.",
                    "In the same wok, fry onion for 2 minutes until translucent.",
                    "Add the rice, breaking up any clumps, and stir fry for 3 minutes.",
                    "Pour soy sauce over the rice and toss well. Add back the scrambled egg and mix.",
                    "Finish with sesame oil and garnish with spring onions. Serve hot."
                ),
                DietaryType.NON_VEGETARIAN, CuisineType.ASIAN
            ),
            new Recipe("Banana Pancakes", 2,
                List.of(ing("ripe bananas", "2, mashed"), ing("eggs", "2"), ing("flour", "½ cup"),
                        ing("milk", "¼ cup"), ing("baking powder", "1 tsp"), ing("butter", "for frying")),
                List.of(
                    "Mash bananas in a bowl until completely smooth.",
                    "Whisk in eggs and milk until combined.",
                    "Fold in flour and baking powder to make a thick batter — do not overmix.",
                    "Heat butter in a non-stick pan over medium heat. Pour small rounds of batter.",
                    "Cook 2 minutes per side until golden brown. Serve with honey or maple syrup."
                ),
                DietaryType.VEGETARIAN, CuisineType.OTHER
            ),
            new Recipe("Tomato Soup", 4,
                List.of(ing("tomatoes", "6 large, halved"), ing("onion", "1, chopped"), ing("garlic", "4 cloves"),
                        ing("vegetable broth", "2 cups"), ing("butter", "1 tbsp"), ing("cream", "¼ cup"),
                        ing("fresh basil", "a handful"), ing("salt & pepper", "to taste")),
                List.of(
                    "Preheat oven to 200°C. Place tomatoes, onion, and garlic on a baking tray, drizzle with oil, and roast for 25 minutes until caramelised.",
                    "Transfer roasted vegetables to a pot. Add vegetable broth and bring to a simmer for 5 minutes.",
                    "Blend the mixture using an immersion blender until completely smooth.",
                    "Stir in butter and cream. Season with salt and pepper.",
                    "Simmer for 5 more minutes. Ladle into bowls and garnish with fresh basil leaves."
                ),
                DietaryType.VEGETARIAN, CuisineType.OTHER
            )
        ));
    }
}
