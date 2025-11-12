package com.e_ticaret_sitesi.mongodb.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // HttpMethod'u import edin
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy; // JWT için bu gerekli
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // === YENİ EKLENEN GÜVENLİK DUVARI (FILTER CHAIN) ===
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))


                .authorizeHttpRequests(auth -> auth

                        // Kullanıcı API'leri (Zaten vardı)
                        .requestMatchers("/kullanicilar/kayit").permitAll()
                        .requestMatchers("/kullanicilar/giris").permitAll()

                        // --- YENİ EKLENEN KURALLAR (HAFTA 3) ---
                        // Ürünleri GÖRMEK (GET) herkese serbest
                        .requestMatchers(HttpMethod.GET, "/urunler").permitAll()
                        .requestMatchers(HttpMethod.GET, "/urunler/{id}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/urun-ekle").permitAll()
                        .requestMatchers(HttpMethod.POST, "/toplu-urun-ekle").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/urunler/{id}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/urunler/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/urunler/filtrele").permitAll()
                        .requestMatchers(HttpMethod.GET, "/urunler/ara").permitAll()
                        // ----------------------------------------

                        // Yukarıdaki istisnalar DIŞINDA kalan TÜM istekler
                        // (örn: POST /api/urunler - Yeni ürün ekleme)
                        // kimlik doğrulaması (JWT token) GEREKTİRSİN
                        .anyRequest().authenticated()
                );
        // ============================

        return http.build();
    }
    // =======================================================
}