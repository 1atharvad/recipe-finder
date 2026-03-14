package com.atharvadevasthali.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class Ingredient {

    @Column(name = "ingredient_name")
    private String name;

    @Column(name = "ingredient_quantity")
    private String quantity;

    public Ingredient() {}

    public Ingredient(String name, String quantity) {
        this.name = name;
        this.quantity = quantity;
    }

    public String getName() { return name; }
    public String getQuantity() { return quantity; }
    public void setName(String name) { this.name = name; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
}
