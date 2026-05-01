# Configuração CORS para o Backend Spring Boot

Para permitir que o frontend (rodando em http://localhost:5173) se comunique com o backend (rodando em http://localhost:8080), você precisa adicionar configuração CORS.

## Opção 1: Configuração Global (Recomendado)

Crie uma classe de configuração no seu projeto Spring Boot:

```java
package com.seupackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## Opção 2: Anotação no Controller

Adicione a anotação `@CrossOrigin` diretamente no seu controller:

```java
package com.seupackage.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        // Sua lógica aqui
        return new ChatResponse(/* ... */);
    }
}
```

## Opção 3: application.properties / application.yml

Adicione no `application.properties`:

```properties
# CORS
spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

Ou no `application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins: http://localhost:5173
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
      allow-credentials: true
```

## Testando

Depois de aplicar a configuração:

1. Reinicie o backend Spring Boot
2. No terminal do frontend, execute: `npm install` e depois `npm run dev`
3. Acesse http://localhost:5173
4. Teste enviando uma mensagem

Se ainda tiver problemas de CORS, verifique:
- Se o backend está rodando na porta 8080
- Se o frontend está rodando na porta 5173
- Logs do console do navegador para erros de CORS
