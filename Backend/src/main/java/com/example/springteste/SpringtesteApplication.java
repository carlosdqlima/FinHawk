package com.example.springteste;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.springteste")
public class SpringtesteApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringtesteApplication.class, args);
    }
}
