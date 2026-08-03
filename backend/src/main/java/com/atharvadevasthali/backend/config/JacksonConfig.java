package com.atharvadevasthali.backend.config;

import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    // Explicit registration (rather than relying on Jackson's ServiceLoader
    // auto-detection) so a lazily-loaded Hibernate association — e.g.
    // Recipe.owner — serializes as the real entity instead of blowing up on
    // the proxy's internal fields ("No serializer found for class
    // org.hibernate.proxy.pojo.bytebuddy.ByteBuddyInterceptor").
    //
    // FORCE_LAZY_LOADING is required: without it, Hibernate6Module's default
    // behavior is to silently serialize *any* uninitialized lazy proxy or
    // collection (e.g. Recipe.ingredients/steps) as null instead of loading
    // it, which would otherwise happen naturally on access — this stays
    // safe under Spring's default open-in-view (session is still open here).
    @Bean
    public Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        module.enable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }
}
