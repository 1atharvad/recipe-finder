package com.atharvadevasthali.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class IngredientDTO {
    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String quantity;

    public String getName() { return name; }
    public String getQuantity() { return quantity; }

    public void setName(String name) { this.name = name; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
}
